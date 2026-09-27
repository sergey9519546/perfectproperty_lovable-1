import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getUserSubscriptionSummary } from "./subscriptions/subscription-service";

export const getCurrentUserSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    const claims = context.claims as { admin?: boolean; role?: string } | undefined;
    return getUserSubscriptionSummary(userId, claims);
  });
