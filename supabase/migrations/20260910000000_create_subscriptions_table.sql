-- Migration: 20260910000000_create_subscriptions_table.sql
-- Description: Create subscriptions table for Paddle Billing integration and user tier gating

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    customer_id TEXT,
    subscription_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'paused', 'canceled')),
    tier TEXT NOT NULL DEFAULT 'starter' CHECK (tier IN ('starter', 'pro', 'enterprise')),
    billing_cycle TEXT NOT NULL DEFAULT 'month' CHECK (billing_cycle IN ('month', 'year')),
    price_id TEXT,
    currency TEXT NOT NULL DEFAULT 'USD',
    amount NUMERIC DEFAULT 0,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    canceled_at TIMESTAMPTZ,
    paddle_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for lightning fast lookups during paywall evaluation and webhook processing
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_id ON public.subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON public.subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view their own subscription records
CREATE POLICY "Users can read own subscriptions"
    ON public.subscriptions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid()::text);

-- Policy: Service role has full unrestricted access for webhook ingestion & admin sync
CREATE POLICY "Service role has full access to subscriptions"
    ON public.subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
