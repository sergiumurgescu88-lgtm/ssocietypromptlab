import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export interface PromptRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  system_prompt: string | null;
  tags: string[] | null;
  default_model: string | null;
  default_settings: Record<string, unknown> | null;
  uses: number | null;
  win_rate: number | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version_num: number;
  content: string;
  system_prompt: string | null;
  settings: Record<string, unknown> | null;
  created_at: string;
}

interface PromptsState {
  prompts: PromptRow[];
  loading: boolean;
  search: string;
  filterModel: string;
  filterTag: string;
  sortBy: "title" | "created_at" | "updated_at" | "win_rate" | "uses";
  sortDir: "asc" | "desc";
  viewMode: "grid" | "list";

  setSearch: (s: string) => void;
  setFilterModel: (m: string) => void;
  setFilterTag: (t: string) => void;
  setSortBy: (s: PromptsState["sortBy"]) => void;
  setSortDir: (d: "asc" | "desc") => void;
  setViewMode: (v: "grid" | "list") => void;

  fetchPrompts: () => Promise<void>;
  createPrompt: (data: { title: string; content: string; system_prompt?: string; tags?: string[]; default_model?: string }) => Promise<string | null>;
  updatePrompt: (id: string, data: Partial<Pick<PromptRow, "title" | "content" | "system_prompt" | "tags" | "default_model" | "status">>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  fetchVersions: (promptId: string) => Promise<PromptVersion[]>;
  saveVersion: (promptId: string, content: string, systemPrompt?: string) => Promise<void>;
}

export const usePromptsStore = create<PromptsState>((set, get) => ({
  prompts: [],
  loading: false,
  search: "",
  filterModel: "all",
  filterTag: "all",
  sortBy: "updated_at",
  sortDir: "desc",
  viewMode: "grid",

  setSearch: (search) => set({ search }),
  setFilterModel: (filterModel) => set({ filterModel }),
  setFilterTag: (filterTag) => set({ filterTag }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortDir: (sortDir) => set({ sortDir }),
  setViewMode: (viewMode) => set({ viewMode }),

  fetchPrompts: async () => {
    set({ loading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ loading: false }); return; }
    const { data } = await supabase
      .from("prompts")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    set({ prompts: (data ?? []) as unknown as PromptRow[], loading: false });
  },

  createPrompt: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: row, error } = await supabase
      .from("prompts")
      .insert({ user_id: user.id, ...data })
      .select("id")
      .single();
    if (error || !row) return null;
    // Save initial version
    await supabase.from("prompt_versions").insert({
      prompt_id: row.id,
      version_num: 1,
      content: data.content,
      system_prompt: data.system_prompt || "",
    });
    await get().fetchPrompts();
    return row.id;
  },

  updatePrompt: async (id, data) => {
    await supabase.from("prompts").update(data).eq("id", id);
    await get().fetchPrompts();
  },

  deletePrompt: async (id) => {
    await supabase.from("prompts").delete().eq("id", id);
    await get().fetchPrompts();
  },

  fetchVersions: async (promptId) => {
    const { data } = await supabase
      .from("prompt_versions")
      .select("*")
      .eq("prompt_id", promptId)
      .order("version_num", { ascending: false });
    return (data ?? []) as unknown as PromptVersion[];
  },

  saveVersion: async (promptId, content, systemPrompt) => {
    const versions = await get().fetchVersions(promptId);
    const nextNum = versions.length > 0 ? Math.max(...versions.map((v) => v.version_num)) + 1 : 1;
    await supabase.from("prompt_versions").insert({
      prompt_id: promptId,
      version_num: nextNum,
      content,
      system_prompt: systemPrompt || "",
    });
  },
}));
