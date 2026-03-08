import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ApiProvider = Database["public"]["Enums"]["api_provider"];

interface ApiKey {
  id: string;
  provider: ApiProvider;
  encrypted_key: string;
  label: string | null;
  created_at: string;
}

// Simple obfuscation (NOT real encryption - for real apps use server-side encryption)
const obfuscate = (key: string): string => btoa(encodeURIComponent(key));
const deobfuscate = (encoded: string): string => decodeURIComponent(atob(encoded));

interface ApiKeysState {
  keys: ApiKey[];
  loading: boolean;
  fetchKeys: () => Promise<void>;
  addKey: (provider: ApiProvider, key: string, label?: string) => Promise<{ error: string | null }>;
  removeKey: (id: string) => Promise<{ error: string | null }>;
  getDecryptedKey: (provider: ApiProvider) => string | null;
}

export const useApiKeysStore = create<ApiKeysState>((set, get) => ({
  keys: [],
  loading: false,

  fetchKeys: async () => {
    set({ loading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ loading: false }); return; }
    const { data } = await supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", user.id);
    set({ keys: data ?? [], loading: false });
  },

  addKey: async (provider, key, label) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    const { error } = await supabase
      .from("api_keys")
      .upsert({
        user_id: user.id,
        provider,
        encrypted_key: obfuscate(key),
        label: label || provider,
      }, { onConflict: "user_id,provider" });
    if (!error) await get().fetchKeys();
    return { error: error?.message ?? null };
  },

  removeKey: async (id) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (!error) await get().fetchKeys();
    return { error: error?.message ?? null };
  },

  getDecryptedKey: (provider) => {
    const found = get().keys.find((k) => k.provider === provider);
    if (!found) return null;
    try { return deobfuscate(found.encrypted_key); } catch { return null; }
  },
}));
