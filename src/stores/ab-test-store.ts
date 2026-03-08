import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface ABTestVariant {
  label: string;
  content: string;
  systemPrompt: string;
}

export interface ABTestRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  variants: ABTestVariant[];
  metric: string;
  target_model: string | null;
  sample_size: number | null;
  status: string | null;
  results_json: Record<string, unknown> | null;
  winner_variant: number | null;
  confidence: number | null;
  created_at: string;
  updated_at: string;
}

export interface TestRunRow {
  id: string;
  test_id: string;
  variant_index: number;
  input_text: string;
  output_text: string | null;
  score: number | null;
  tokens: number | null;
  latency: number | null;
  created_at: string;
}

interface ABTestState {
  tests: ABTestRow[];
  runs: TestRunRow[];
  loading: boolean;

  fetchTests: () => Promise<void>;
  createTest: (data: {
    name: string;
    description?: string;
    variants: ABTestVariant[];
    metric: string;
    target_model: string;
    sample_size: number;
  }) => Promise<string | null>;
  updateTest: (id: string, data: Partial<Pick<ABTestRow, "status" | "results_json" | "winner_variant" | "confidence">>) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  fetchRuns: (testId: string) => Promise<TestRunRow[]>;
  insertRun: (run: {
    test_id: string;
    variant_index: number;
    input_text: string;
    output_text: string;
    score: number;
    tokens: number;
    latency: number;
  }) => Promise<void>;
}

export const useABTestStore = create<ABTestState>((set, get) => ({
  tests: [],
  runs: [],
  loading: false,

  fetchTests: async () => {
    set({ loading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ loading: false }); return; }
    const { data } = await supabase
      .from("ab_tests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const mapped = (data ?? []).map((d) => ({
      ...d,
      variants: (d.variants as unknown as ABTestVariant[]) ?? [],
      results_json: d.results_json as Record<string, unknown> | null,
    }));
    set({ tests: mapped as ABTestRow[], loading: false });
  },

  createTest: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: row, error } = await supabase
      .from("ab_tests")
      .insert({
        user_id: user.id,
        name: data.name,
        description: data.description || "",
        variants: data.variants as unknown as Json,
        metric: data.metric,
        target_model: data.target_model,
        sample_size: data.sample_size,
      })
      .select("id")
      .single();
    if (error || !row) return null;
    await get().fetchTests();
    return row.id;
  },

  updateTest: async (id, data) => {
    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.results_json !== undefined) updateData.results_json = data.results_json as unknown as Json;
    if (data.winner_variant !== undefined) updateData.winner_variant = data.winner_variant;
    if (data.confidence !== undefined) updateData.confidence = data.confidence;
    await supabase.from("ab_tests").update(updateData).eq("id", id);
    await get().fetchTests();
  },

  deleteTest: async (id) => {
    await supabase.from("ab_tests").delete().eq("id", id);
    await get().fetchTests();
  },

  fetchRuns: async (testId) => {
    const { data } = await supabase
      .from("test_runs")
      .select("*")
      .eq("test_id", testId)
      .order("created_at", { ascending: true });
    const runs = (data ?? []) as unknown as TestRunRow[];
    set({ runs });
    return runs;
  },

  insertRun: async (run) => {
    await supabase.from("test_runs").insert(run);
  },
}));
