import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export interface MarketplacePrompt {
  id: string;
  creator_id: string;
  prompt_id: string | null;
  title: string;
  description: string;
  price: number;
  content_preview: string;
  tags: string[];
  model_compatibility: string[];
  rating: number;
  ratings_count: number;
  sales_count: number;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  // joined
  creator_name?: string;
}

export interface Purchase {
  id: string;
  buyer_id: string;
  marketplace_prompt_id: string;
  license_key: string;
  amount: number;
  platform_fee: number;
  creator_payout: number;
  purchased_at: string;
}

interface MarketplaceState {
  listings: MarketplacePrompt[];
  myListings: MarketplacePrompt[];
  myPurchases: Purchase[];
  mySales: Purchase[];
  loading: boolean;
  search: string;
  categoryFilter: string;
  modelFilter: string;
  sortBy: "newest" | "popular" | "rating" | "price_low" | "price_high";

  setSearch: (s: string) => void;
  setCategoryFilter: (c: string) => void;
  setModelFilter: (m: string) => void;
  setSortBy: (s: MarketplaceState["sortBy"]) => void;

  fetchListings: () => Promise<void>;
  fetchMyListings: (userId: string) => Promise<void>;
  fetchMyPurchases: (userId: string) => Promise<void>;
  fetchMySales: (userId: string) => Promise<void>;
  publishPrompt: (data: Partial<MarketplacePrompt>) => Promise<void>;
  purchasePrompt: (promptId: string, buyerId: string) => Promise<void>;
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  listings: [],
  myListings: [],
  myPurchases: [],
  mySales: [],
  loading: false,
  search: "",
  categoryFilter: "all",
  modelFilter: "all",
  sortBy: "newest",

  setSearch: (search) => set({ search }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setModelFilter: (modelFilter) => set({ modelFilter }),
  setSortBy: (sortBy) => set({ sortBy }),

  fetchListings: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from("marketplace_prompts")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    set({ listings: (data as MarketplacePrompt[]) ?? [], loading: false });
  },

  fetchMyListings: async (userId) => {
    const { data } = await supabase
      .from("marketplace_prompts")
      .select("*")
      .eq("creator_id", userId);
    set({ myListings: (data as MarketplacePrompt[]) ?? [] });
  },

  fetchMyPurchases: async (userId) => {
    const { data } = await supabase
      .from("purchases")
      .select("*")
      .eq("buyer_id", userId)
      .order("purchased_at", { ascending: false });
    set({ myPurchases: (data as Purchase[]) ?? [] });
  },

  fetchMySales: async (userId) => {
    // This uses the creator policy on purchases
    const { data: myListings } = await supabase
      .from("marketplace_prompts")
      .select("id")
      .eq("creator_id", userId);
    if (!myListings?.length) { set({ mySales: [] }); return; }
    const ids = myListings.map((l) => l.id);
    const { data } = await supabase
      .from("purchases")
      .select("*")
      .in("marketplace_prompt_id", ids)
      .order("purchased_at", { ascending: false });
    set({ mySales: (data as Purchase[]) ?? [] });
  },

  publishPrompt: async (data) => {
    await supabase.from("marketplace_prompts").insert(data as any);
    await get().fetchListings();
  },

  purchasePrompt: async (marketplacePromptId, buyerId) => {
    const listing = get().listings.find((l) => l.id === marketplacePromptId);
    if (!listing) return;
    const platformFee = +(listing.price * 0.2).toFixed(2);
    const creatorPayout = +(listing.price - platformFee).toFixed(2);

    await supabase.from("purchases").insert({
      buyer_id: buyerId,
      marketplace_prompt_id: marketplacePromptId,
      amount: listing.price,
      platform_fee: platformFee,
      creator_payout: creatorPayout,
    } as any);

    // Increment sales count
    await supabase
      .from("marketplace_prompts")
      .update({ sales_count: (listing.sales_count ?? 0) + 1 } as any)
      .eq("id", marketplacePromptId);

    await get().fetchListings();
    await get().fetchMyPurchases(buyerId);
  },
}));
