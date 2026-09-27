import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { upsertSubscriptionRecord } from "@/lib/subscriptions/subscription-service";
import { SubscriptionStatus, SubscriptionTier, BillingCycle } from "@/lib/subscriptions/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Validates the Paddle v2 webhook signature.
 * Format: `ts=1690000000;h1=hash`
 */
function verifyPaddleSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET_KEY;
  // If no webhook secret is configured yet in environment, allow testing in development/preview
  if (!secret) {
    console.warn("[PaddleWebhook] No PADDLE_WEBHOOK_SECRET_KEY configured; processing event without signature enforcement");
    return true;
  }
  if (!signatureHeader) return false;

  const parts = signatureHeader.split(";").reduce<Record<string, string>>((acc, curr) => {
    const [k, v] = curr.split("=");
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});

  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  // Prevent replay attacks (max 5 minutes difference)
  const tsNum = parseInt(ts, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - tsNum) > 300) {
    console.warn("[PaddleWebhook] Timestamp out of tolerance window:", { tsNum, now });
    return false;
  }

  const payloadToSign = `${ts}:${rawBody}`;
  const computedHash = createHmac("sha256", secret).update(payloadToSign).digest("hex");

  try {
    const a = Buffer.from(computedHash, "utf8");
    const b = Buffer.from(h1, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Resolves subscription tier from price ID or custom data.
 */
function resolveTier(priceId?: string, customData?: Record<string, any>): SubscriptionTier {
  if (customData?.tier && ["starter", "pro", "enterprise"].includes(customData.tier)) {
    return customData.tier as SubscriptionTier;
  }
  const pid = (priceId || "").toLowerCase();
  if (pid.includes("enterprise")) return "enterprise";
  if (pid.includes("starter")) return "starter";
  return "pro"; // Default to pro for standard tier
}

export const Route = createFileRoute("/api/webhooks/paddle")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const rawBody = await request.text();
          const signatureHeader = request.headers.get("paddle-signature");

          if (!verifyPaddleSignature(rawBody, signatureHeader)) {
            console.error("[PaddleWebhook] Invalid signature check");
            return new Response(JSON.stringify({ error: "Invalid signature" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          let event: any;
          try {
            event = JSON.parse(rawBody);
          } catch {
            return new Response(JSON.stringify({ error: "Malformed JSON" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const eventType: string = event.event_type || "";
          const data: any = event.data || {};
          console.log(`[PaddleWebhook] Received event: ${eventType} (ID: ${event.event_id || data.id})`);

          // Handle subscription events
          if (eventType.startsWith("subscription.")) {
            const subscriptionId = data.id;
            const customerId = data.customer_id;
            const customData = data.custom_data || {};
            let userId = customData.user_id || customData.userId;

            // If userId wasn't in custom_data, try looking up user via customerId or email
            if (!userId && customerId) {
              const { data: existingSub } = await supabaseAdmin
                .from("subscriptions")
                .select("user_id")
                .eq("customer_id", customerId)
                .maybeSingle();
              if (existingSub?.user_id) {
                userId = existingSub.user_id;
              }
            }

            if (!userId) {
              console.warn(`[PaddleWebhook] Could not resolve userId for subscription ${subscriptionId}`);
              return new Response(
                JSON.stringify({ received: true, note: "User not resolved yet" }),
                { status: 200, headers: { "Content-Type": "application/json" } },
              );
            }

            const item = data.items?.[0];
            const price = item?.price;
            const priceId = price?.id;
            const tier = resolveTier(priceId, customData);
            const billingCycle: BillingCycle =
              data.billing_cycle?.interval === "year" || price?.billing_cycle?.interval === "year"
                ? "year"
                : "month";

            let status: SubscriptionStatus = "active";
            if (data.status === "trialing") status = "trialing";
            else if (data.status === "past_due") status = "past_due";
            else if (data.status === "paused") status = "paused";
            else if (data.status === "canceled" || eventType === "subscription.canceled") status = "canceled";

            const currentPeriodStart = data.current_billing_period?.starts_at || null;
            const currentPeriodEnd = data.current_billing_period?.ends_at || null;
            const cancelAtPeriodEnd = Boolean(data.scheduled_change?.action === "cancel");
            const canceledAt = data.canceled_at || (status === "canceled" ? new Date().toISOString() : null);

            const amount = Number(item?.price?.unit_price?.amount || 0) / 100;
            const currency = item?.price?.unit_price?.currency_code || "USD";

            await upsertSubscriptionRecord({
              userId,
              customerId,
              subscriptionId,
              status,
              tier,
              billingCycle,
              priceId,
              currency,
              amount,
              currentPeriodStart,
              currentPeriodEnd,
              cancelAtPeriodEnd,
              canceledAt,
              paddleData: {
                eventType,
                eventId: event.event_id,
                occurredAt: event.occurred_at,
                data,
              },
            });

            console.log(`[PaddleWebhook] Successfully synced subscription ${subscriptionId} for user ${userId} -> ${tier} (${status})`);
          }

          return new Response(
            JSON.stringify({ received: true, event_type: eventType }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        } catch (err: any) {
          console.error("[PaddleWebhook] Exception during processing:", err);
          return new Response(
            JSON.stringify({ error: err?.message || "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
