
-- Prompts table
CREATE TABLE public.prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  system_prompt TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  default_model TEXT DEFAULT 'gemini',
  default_settings JSONB DEFAULT '{"temperature":0.7,"maxTokens":1024,"topP":0.9}',
  uses INTEGER DEFAULT 0,
  win_rate NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','testing','published')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prompts" ON public.prompts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prompts" ON public.prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prompts" ON public.prompts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own prompts" ON public.prompts FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Prompt versions table
CREATE TABLE public.prompt_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  version_num INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  system_prompt TEXT DEFAULT '',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (prompt_id, version_num)
);

ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of own prompts" ON public.prompt_versions
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.prompts WHERE prompts.id = prompt_id AND prompts.user_id = auth.uid()));
CREATE POLICY "Users can insert versions of own prompts" ON public.prompt_versions
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.prompts WHERE prompts.id = prompt_id AND prompts.user_id = auth.uid()));

-- A/B Tests table
CREATE TABLE public.ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  variants JSONB NOT NULL DEFAULT '[]',
  metric TEXT NOT NULL DEFAULT 'length' CHECK (metric IN ('length','sentiment','keyword_match','human_rating')),
  target_model TEXT DEFAULT 'gemini',
  sample_size INTEGER DEFAULT 30,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','running','completed','cancelled')),
  results_json JSONB DEFAULT '{}',
  winner_variant INTEGER,
  confidence NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ab tests" ON public.ab_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ab tests" ON public.ab_tests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ab tests" ON public.ab_tests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ab tests" ON public.ab_tests FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_ab_tests_updated_at
  BEFORE UPDATE ON public.ab_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Test runs table
CREATE TABLE public.test_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.ab_tests(id) ON DELETE CASCADE NOT NULL,
  variant_index INTEGER NOT NULL,
  input_text TEXT NOT NULL,
  output_text TEXT DEFAULT '',
  score NUMERIC(5,2) DEFAULT 0,
  tokens INTEGER DEFAULT 0,
  latency NUMERIC(8,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own test runs" ON public.test_runs
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.ab_tests WHERE ab_tests.id = test_id AND ab_tests.user_id = auth.uid()));
CREATE POLICY "Users can insert own test runs" ON public.test_runs
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.ab_tests WHERE ab_tests.id = test_id AND ab_tests.user_id = auth.uid()));

-- Index for search
CREATE INDEX idx_prompts_user ON public.prompts(user_id);
CREATE INDEX idx_prompts_tags ON public.prompts USING GIN(tags);
CREATE INDEX idx_prompts_search ON public.prompts USING GIN(to_tsvector('english', title || ' ' || content));
