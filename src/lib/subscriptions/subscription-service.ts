import {
  SubscriptionRecord,
  SubscriptionStatus,
  SubscriptionTier,
  BillingCycle,
  isSubscriptionActive,
} from "./types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { db } from "@/integrations/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

export interface UserSubscriptionSummary {
  isSubscribed: boolean;
  tier: SubscriptionTier | "free" | "admin";
  status: SubscriptionStatus | "none";
  subscription: SubscriptionRecord | null;
  expiresAt: string | null;
}

/**
 * Fetches current active subscription for a user across Supabase & Firestore.
 */
export async function getUserSubscriptionSummary(
  userId: string,
  userClaims?: { admin?: boolean; role?: string },
): Promise<UserSubscriptionSummary> {
  if (!userId) {
    return {
      isSubscribed: false,
      tier: "free",
      status: "none",
      subscription: null,
      expiresAt: null,
    };
  }

  // Demo user or Admin claim gets Pro tier access
  if (userId === DEMO_USER_ID || userClaims?.admin || userClaims?.role === "admin") {
    return {
      isSubscribed: true,
      tier: "pro",
      status: "active",
      subscription: {
        id: "sub_demo_internal",
        userId,
        customerId: "ctm_demo",
        subscriptionId: "sub_demo_internal",
        status: "active",
        tier: "pro",
        billingCycle: "month",
        currency: "USD",
        amount: 249,
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      expiresAt: null,
    };
  }

  try {
    // 1. Check Supabase subscriptions table
    const { data: subRow, error: subErr } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subErr && subRow) {
      const active = isSubscriptionActive({
        status: subRow.status,
        currentPeriodEnd: subRow.current_period_end,
      });

      if (active) {
        const record: SubscriptionRecord = {
          id: subRow.id,
          userId: subRow.user_id,
          customerId: subRow.customer_id,
          subscriptionId: subRow.subscription_id,
          status: subRow.status as SubscriptionStatus,
          tier: (subRow.tier as SubscriptionTier) || "starter",
          billingCycle: (subRow.billing_cycle as BillingCycle) || "month",
          priceId: subRow.price_id,
          currency: subRow.currency || "USD",
          amount: Number(subRow.amount || 0),
          currentPeriodStart: subRow.current_period_start,
          currentPeriodEnd: subRow.current_period_end,
          cancelAtPeriodEnd: Boolean(subRow.cancel_at_period_end),
          canceledAt: subRow.canceled_at,
          paddleData: subRow.paddle_data || {},
          createdAt: subRow.created_at,
          updatedAt: subRow.updated_at,
        };

        return {
          isSubscribed: true,
          tier: record.tier,
          status: record.status,
          subscription: record,
          expiresAt: record.currentPeriodEnd || null,
        };
      }
    }

    // 2. Check Firestore UserProfile tier
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const tier = userData?.tier;
        if (tier === "pro" || tier === "enterprise" || tier === "starter") {
          return {
            isSubscribed: true,
            tier,
            status: "active",
            subscription: null,
            expiresAt: null,
          };
        }
      }
    } catch {
      // Ignore Firestore read error and fallback to free
    }

    return {
      isSubscribed: false,
      tier: "free",
      status: "none",
      subscription: null,
      expiresAt: null,
    };
  } catch (err) {
    console.error("[SubscriptionService] Failed to retrieve subscription:", err);
    return {
      isSubscribed: false,
      tier: "free",
      status: "none",
      subscription: null,
      expiresAt: null,
    };
  }
}

/**
 * Upserts a subscription record into both Supabase and Firestore.
 */
export async function upsertSubscriptionRecord(
  record: Partial<SubscriptionRecord> & { userId: string; subscriptionId: string },
): Promise<void> {
  const now = new Date().toISOString();

  // 1. Supabase upsert
  try {
    const { error } = await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: record.userId,
        customer_id: record.customerId ?? null,
        subscription_id: record.subscriptionId,
        status: record.status || "active",
        tier: record.tier || "starter",
        billing_cycle: record.billingCycle || "month",
        price_id: record.priceId ?? null,
        currency: record.currency || "USD",
        amount: record.amount || 0,
        current_period_start: record.currentPeriodStart ?? null,
        current_period_end: record.currentPeriodEnd ?? null,
        cancel_at_period_end: record.cancelAtPeriodEnd ?? false,
        canceled_at: record.canceledAt ?? null,
        paddle_data: record.paddleData || {},
        updated_at: now,
      },
      { onConflict: "subscription_id" },
    );

    if (error) {
      console.error("[SubscriptionService] Supabase upsert failed:", error.message);
    }
  } catch (e) {
    console.error("[SubscriptionService] Supabase exception:", e);
  }

  // 2. Firestore user profile tier sync
  try {
    const userRef = doc(db, "users", record.userId);
    const tierToSet = record.status === "active" || record.status === "trialing" ? record.tier || "starter" : "free";

    await setDoc(
      userRef,
      {
        tier: tierToSet,
        subscriptionId: record.subscriptionId,
        subscriptionStatus: record.status || "active",
        updatedAt: now,
      },
      { merge: true },
    );
  } catch (e) {
    console.error("[SubscriptionService] Firestore sync error:", e);
  }
}
