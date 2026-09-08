import { z } from "zod";
import { clientProductEvents } from "./product-analytics";

const analyticsValue = z.union([
  z.string().max(500),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

const properties = z
  .record(z.string().min(1).max(80), analyticsValue)
  .refine((value) => Object.keys(value).length <= 30, "Too many analytics properties");

const contextSchema = z.object({
  client_event_id: z.string().uuid(),
  occurred_at: z.string().datetime({ offset: true }),
  session_id: z.string().uuid(),
  anonymous_id: z.string().uuid(),
  route: z.string().min(1).max(300),
  device_class: z.enum(["mobile", "tablet", "desktop"]),
  reduced_motion: z.boolean(),
  experiment_id: z.string().max(80).nullable(),
  experiment_variant: z.string().max(80).nullable(),
  analytics_allowed: z.boolean(),
});

export const productEventSchema = contextSchema
  .extend({
    event_name: z.enum(clientProductEvents),
    entity_type: z.string().max(40).optional(),
    entity_id: z.string().max(160).optional(),
    success: z.boolean().optional(),
    duration_ms: z.number().int().min(0).max(86_400_000).optional(),
    properties: properties.default({}),
  })
  .superRefine((event, context) => {
    if (event.event_name === "market_selected" || event.event_name === "evidence_viewed") {
      if (event.entity_type !== "market" || !event.entity_id) {
        context.addIssue({
          code: "custom",
          path: ["entity_id"],
          message: "Market events require a market identity",
        });
      }
    }
    if (
      (event.event_name === "story_viewed" || event.event_name === "evidence_viewed") &&
      (event.duration_ms ?? 0) < 5000
    ) {
      context.addIssue({
        code: "custom",
        path: ["duration_ms"],
        message: "Qualified exposure requires at least five seconds",
      });
    }
    if (event.event_name === "web_vital") {
      const metricName = event.properties.metric_name;
      if (!["LCP", "CLS_MILLI", "INTERACTION_LATENCY"].includes(String(metricName))) {
        context.addIssue({
          code: "custom",
          path: ["properties", "metric_name"],
          message: "Unsupported experience metric",
        });
      }
    }
  });

export const workflowActionSchema = contextSchema.extend({
  action_type: z.enum(["underwrite", "brief_export"]),
  market_id: z.string().min(1).max(160),
  market_name: z.string().min(1).max(200),
  input_snapshot: properties,
  properties: properties.default({}),
});

export function requestIsSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const requestHost =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
    return originHost === requestHost;
  } catch {
    return false;
  }
}

export async function readAnalyticsBody(request: Request): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > 24_000) {
    throw new Error("Analytics payload too large");
  }
  const raw = await request.text();
  if (raw.length > 24_000) throw new Error("Analytics payload too large");
  return JSON.parse(raw);
}

type RpcResult = { data: unknown; error: { message: string } | null };
type Rpc = (name: string, params: Record<string, unknown>) => Promise<RpcResult>;

// In-memory buffer for diagnostic telemetries when upstream database is unreachable
const memoryEventBuffer: Array<{ event: string; at: string; route: string }> = [];
const MAX_MEMORY_EVENTS = 200;

function bufferInMemoryEvent(event_name: string, occurred_at: string, route: string) {
  if (memoryEventBuffer.length >= MAX_MEMORY_EVENTS) memoryEventBuffer.shift();
  memoryEventBuffer.push({ event: event_name, at: occurred_at, route });
}

async function analyticsServerContext(request: Request): Promise<{ rpc: Rpc | null; userId: string | null }> {
  let userId: string | null = null;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const authorization = request.headers.get("authorization");
    if (authorization?.startsWith("Bearer ")) {
      const token = authorization.slice(7).trim();
      if (token) {
        try {
          const { data, error } = await supabaseAdmin.auth.getClaims(token);
          if (!error && typeof data?.claims?.sub === "string") userId = data.claims.sub;
        } catch {
          // Token claims check is opportunistic
        }
      }
    }
    const rpc = supabaseAdmin.rpc.bind(supabaseAdmin) as unknown as Rpc;
    return { rpc, userId };
  } catch {
    return { rpc: null, userId: null };
  }
}

export async function recordProductEvent(request: Request, input: z.infer<typeof productEventSchema>): Promise<boolean> {
  bufferInMemoryEvent(input.event_name, input.occurred_at, input.route);
  try {
    const { rpc, userId } = await analyticsServerContext(request);
    if (!rpc) return true;

    const result = await rpc("record_product_event", {
      p_client_event_id: input.client_event_id,
      p_event_name: input.event_name,
      p_occurred_at: input.occurred_at,
      p_session_id: input.session_id,
      p_anonymous_id: input.anonymous_id,
      p_user_id: userId,
      p_route: input.route,
      p_entity_type: input.entity_type ?? null,
      p_entity_id: input.entity_id ?? null,
      p_success: input.success ?? null,
      p_duration_ms: input.duration_ms ?? null,
      p_experiment_id: input.experiment_id,
      p_experiment_variant: input.experiment_variant,
      p_device_class: input.device_class,
      p_reduced_motion: input.reduced_motion,
      p_properties: input.properties,
    });
    if (result.error) {
      return true;
    }
    return result.data === true;
  } catch {
    // Upstream network/fetch issue — fallback gracefully
    return true;
  }
}

export async function recordWorkflowAction(
  request: Request,
  input: z.infer<typeof workflowActionSchema>,
): Promise<string> {
  bufferInMemoryEvent(`action:${input.action_type}`, input.occurred_at, input.route);
  try {
    const { rpc, userId } = await analyticsServerContext(request);
    if (!rpc) return input.client_event_id;

    const result = await rpc("record_workflow_action", {
      p_client_event_id: input.client_event_id,
      p_action_type: input.action_type,
      p_occurred_at: input.occurred_at,
      p_session_id: input.session_id,
      p_anonymous_id: input.anonymous_id,
      p_user_id: userId,
      p_route: input.route,
      p_market_id: input.market_id,
      p_market_name: input.market_name,
      p_device_class: input.device_class,
      p_reduced_motion: input.reduced_motion,
      p_record_analytics: input.analytics_allowed,
      p_input_snapshot: input.input_snapshot,
      p_properties: input.properties,
    });
    if (result.error) {
      return input.client_event_id;
    }
    if (typeof result.data !== "string") return input.client_event_id;
    return result.data;
  } catch {
    return input.client_event_id;
  }
}
