
-- Marketplace prompts (public listings)
CREATE TABLE public.marketplace_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  prompt_id uuid REFERENCES public.prompts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  content_preview text NOT NULL DEFAULT '',
  tags text[] DEFAULT '{}',
  model_compatibility text[] DEFAULT '{"gemini","gpt-4","mistral","deepseek"}',
  rating numeric DEFAULT 0,
  ratings_count integer DEFAULT 0,
  sales_count integer DEFAULT 0,
  category text DEFAULT 'general',
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_prompts ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can browse
CREATE POLICY "Anyone can view active marketplace prompts"
  ON public.marketplace_prompts FOR SELECT TO authenticated
  USING (status = 'active');

CREATE POLICY "Creators can insert own marketplace prompts"
  ON public.marketplace_prompts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own marketplace prompts"
  ON public.marketplace_prompts FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own marketplace prompts"
  ON public.marketplace_prompts FOR DELETE TO authenticated
  USING (auth.uid() = creator_id);

-- Purchases table
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  marketplace_prompt_id uuid REFERENCES public.marketplace_prompts(id) ON DELETE CASCADE NOT NULL,
  license_key text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  amount numeric NOT NULL DEFAULT 0,
  platform_fee numeric NOT NULL DEFAULT 0,
  creator_payout numeric NOT NULL DEFAULT 0,
  purchased_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view own purchases"
  ON public.purchases FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can insert purchases"
  ON public.purchases FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- Creators can see purchases of their prompts
CREATE POLICY "Creators can view sales of own prompts"
  ON public.purchases FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.marketplace_prompts mp
    WHERE mp.id = purchases.marketplace_prompt_id AND mp.creator_id = auth.uid()
  ));

-- Analytics events
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  metadata_json jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own analytics events"
  ON public.analytics_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics events"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  marketplace_prompt_id uuid REFERENCES public.marketplace_prompts(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, marketplace_prompt_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own reviews"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_marketplace_prompts_category ON public.marketplace_prompts(category);
CREATE INDEX idx_marketplace_prompts_creator ON public.marketplace_prompts(creator_id);
CREATE INDEX idx_purchases_buyer ON public.purchases(buyer_id);
CREATE INDEX idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);

-- Updated_at trigger for marketplace_prompts
CREATE TRIGGER update_marketplace_prompts_updated_at
  BEFORE UPDATE ON public.marketplace_prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
