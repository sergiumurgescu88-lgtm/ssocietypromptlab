import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  expertise: string[] | null;
  plan: string;
  credits: number;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Pick<Profile, "full_name" | "bio" | "expertise">>) => Promise<{ error: string | null }>;
  uploadAvatar: (file: File) => Promise<{ url: string | null; error: string | null }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    // Set up listener BEFORE getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        // Use setTimeout to avoid Supabase deadlock
        setTimeout(() => get().fetchProfile(), 0);
      } else {
        set({ profile: null });
      }
    });

    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, loading: false, initialized: true });
    if (session?.user) {
      await get().fetchProfile();
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });
    return { error: error?.message ?? null };
  },

  signUp: async (email, password, fullName) => {
    set({ loading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    set({ loading: false });
    return { error: error?.message ?? null };
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  },

  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) set({ profile: data });
  },

  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return { error: "Not authenticated" };
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);
    if (!error) await get().fetchProfile();
    return { error: error?.message ?? null };
  },

  uploadAvatar: async (file) => {
    const user = get().user;
    if (!user) return { url: null, error: "Not authenticated" };
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (uploadError) return { url: null, error: uploadError.message };
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = data.publicUrl + "?t=" + Date.now();
    await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
    await get().fetchProfile();
    return { url, error: null };
  },
}));
