export type SubscriptionTier = "starter" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "paused" | "canceled";
export type BillingCycle = "month" | "year";

export interface SubscriptionRecord {
  id: string;
  userId: string;
  customerId?: string | null;
  subscriptionId?: string | null;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  billingCycle: BillingCycle;
  priceId?: string | null;
  currency: string;
  amount: number;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string | null;
  paddleData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  badge?: string;
  popular?: boolean;
  prices: {
    month: {
      amount: number;
      priceId?: string;
      intervalLabel: string;
    };
    year: {
      amount: number;
      priceId?: string;
      intervalLabel: string;
      monthlyEquivalent: number;
      savingsBadge: string;
    };
  };
  features: PlanFeature[];
  ctaLabel: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Essential deal pipeline for solo flippers and active wholesalers.",
    prices: {
      month: {
        amount: 99,
        priceId: import.meta.env?.VITE_PADDLE_PRICE_STARTER_MONTHLY || "pri_starter_monthly",
        intervalLabel: "/month",
      },
      year: {
        amount: 948,
        priceId: import.meta.env?.VITE_PADDLE_PRICE_STARTER_ANNUAL || "pri_starter_annual",
        intervalLabel: "/year",
        monthlyEquivalent: 79,
        savingsBadge: "Save 20%",
      },
    },
    features: [
      { text: "Full Cook County, IL ranked deal database (500+ parcels)", included: true },
      { text: "Risk-Adjusted Buy Scores (0–100) & modeled max bids", included: true },
      { text: "Monte Carlo P5 / P50 gross profit distributions", included: true },
      { text: "Spatial comps radius & neighborhood trajectory flags", included: true },
      { text: "Up to 25 saved deals & custom watchlists", included: true },
      { text: "Prophecy 60–90 day pre-distress predictive engine", included: false },
      { text: "Realie live cadastral deed & lien lookups", included: false },
      { text: "Sheriff sale auction workforce & bid recommendation", included: false },
    ],
    ctaLabel: "Get Started",
  },
  {
    id: "pro",
    name: "Professional",
    tagline: "Maximum edge for professional acquisition teams and funds.",
    badge: "Most Popular",
    popular: true,
    prices: {
      month: {
        amount: 249,
        priceId: import.meta.env?.VITE_PADDLE_PRICE_PRO_MONTHLY || "pri_pro_monthly",
        intervalLabel: "/month",
      },
      year: {
        amount: 2388,
        priceId: import.meta.env?.VITE_PADDLE_PRICE_PRO_ANNUAL || "pri_pro_annual",
        intervalLabel: "/year",
        monthlyEquivalent: 199,
        savingsBadge: "Save 20%",
      },
    },
    features: [
      { text: "Everything in Starter plan", included: true },
      { text: "Prophecy 60–90 day pre-distress predictive engine", included: true, highlight: true },
      { text: "Unlimited nationwide Realie parcel lookups & dossiers", included: true, highlight: true },
      { text: "Sheriff & tax sale auction AI workforce scoring", included: true, highlight: true },
      { text: "Unlimited saved watchlists & CSV export", included: true },
      { text: "Priority webhook & daily deal digest alerts", included: true },
      { text: "Skeptic underwriting flags & repair budget breakdown", included: true },
      { text: "VIP support with direct analyst Slack channel", included: true },
    ],
    ctaLabel: "Upgrade to Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Custom data feeds, API webhooks, and institutional models.",
    prices: {
      month: {
        amount: 899,
        priceId: "pri_enterprise_custom",
        intervalLabel: "/month",
      },
      year: {
        amount: 8990,
        priceId: "pri_enterprise_custom_annual",
        intervalLabel: "/year",
        monthlyEquivalent: 749,
        savingsBadge: "Save 17%",
      },
    },
    features: [
      { text: "Everything in Professional plan", included: true },
      { text: "Direct Scrapy spider ingest webhook integrations", included: true },
      { text: "Multi-seat analyst access (up to 10 team members)", included: true },
      { text: "Custom county ingestion on request", included: true },
      { text: "Dedicated account manager & SLA guarantee", included: true },
      { text: "Custom underwriting heuristics & API key", included: true },
    ],
    ctaLabel: "Contact Enterprise",
  },
];

/**
 * Checks whether a given subscription record confers active access.
 */
export function isSubscriptionActive(sub?: { status: string; currentPeriodEnd?: string | null } | null): boolean {
  if (!sub) return false;
  if (sub.status === "active" || sub.status === "trialing") {
    if (!sub.currentPeriodEnd) return true;
    return new Date(sub.currentPeriodEnd).getTime() > Date.now();
  }
  return false;
}

/**
 * Hierarchical check for tier access.
 */
export function hasTierAccess(
  userTier: SubscriptionTier | "free" | "admin" | undefined,
  requiredTier: SubscriptionTier,
): boolean {
  if (userTier === "admin" || userTier === "enterprise") return true;
  if (requiredTier === "starter") {
    return userTier === "starter" || userTier === "pro";
  }
  if (requiredTier === "pro") {
    return userTier === "pro";
  }
  return false;
}
