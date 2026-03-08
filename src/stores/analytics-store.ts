import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: string;
  metadata_json: Record<string, any>;
  created_at: string;
}

export interface AnalyticsSummary {
  totalPrompts: number;
  totalTests: number;
  totalCreditsUsed: number;
  avgScore: number;
  modelUsage: Record<string, number>;
  dailyActivity: { date: string; count: number }[];
  topPrompts: { title: string; uses: number; winRate: number }[];
  revenueData: { date: string; gross: number; net: number }[];
}

interface AnalyticsState {
  events: AnalyticsEvent[];
  summary: AnalyticsSummary;
  loading: boolean;
  period: "7d" | "30d" | "90d";
  setPeriod: (p: AnalyticsState["period"]) => void;
  fetchAnalytics: (userId: string) => Promise<void>;
  trackEvent: (userId: string, eventType: string, metadata?: Record<string, any>) => Promise<void>;
}

const emptySummary: AnalyticsSummary = {
  totalPrompts: 0,
  totalTests: 0,
  totalCreditsUsed: 0,
  avgScore: 0,
  modelUsage: {},
  dailyActivity: [],
  topPrompts: [],
  revenueData: [],
};

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  events: [],
  summary: emptySummary,
  loading: false,
  period: "30d",

  setPeriod: (period) => set({ period }),

  trackEvent: async (userId, eventType, metadata = {}) => {
    await supabase.from("analytics_events").insert({
      user_id: userId,
      event_type: eventType,
      metadata_json: metadata,
    } as any);
  },

  fetchAnalytics: async (userId) => {
    set({ loading: true });
    const periodDays = { "7d": 7, "30d": 30, "90d": 90 }[get().period];
    const since = new Date(Date.now() - periodDays * 86400000).toISOString();

    const [
      { data: prompts },
      { data: tests },
      { data: usageLogs },
      { data: events },
      { data: sales },
    ] = await Promise.all([
      supabase.from("prompts").select("title, uses, win_rate").eq("user_id", userId),
      supabase.from("ab_tests").select("*").eq("user_id", userId),
      supabase.from("usage_logs").select("*").eq("user_id", userId).gte("created_at", since),
      supabase.from("analytics_events").select("*").eq("user_id", userId).gte("created_at", since).order("created_at", { ascending: false }),
      supabase.from("purchases").select("amount, platform_fee, creator_payout, purchased_at"),
    ]);

    // Model usage from usage_logs
    const modelUsage: Record<string, number> = {};
    (usageLogs ?? []).forEach((log: any) => {
      if (log.model) modelUsage[log.model] = (modelUsage[log.model] || 0) + 1;
    });

    // Daily activity
    const dailyMap: Record<string, number> = {};
    (usageLogs ?? []).forEach((log: any) => {
      const day = log.created_at.slice(0, 10);
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    });
    const dailyActivity = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top prompts
    const topPrompts = (prompts ?? [])
      .map((p: any) => ({ title: p.title, uses: p.uses ?? 0, winRate: Number(p.win_rate ?? 0) }))
      .sort((a: any, b: any) => b.uses - a.uses)
      .slice(0, 5);

    // Revenue data (daily gross/net from sales)
    const revMap: Record<string, { gross: number; net: number }> = {};
    (sales ?? []).forEach((s: any) => {
      const day = s.purchased_at.slice(0, 10);
      if (!revMap[day]) revMap[day] = { gross: 0, net: 0 };
      revMap[day].gross += Number(s.amount);
      revMap[day].net += Number(s.creator_payout);
    });
    const revenueData = Object.entries(revMap)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalCreditsUsed = (usageLogs ?? []).reduce((s: number, l: any) => s + (l.tokens ?? 0), 0);
    const scores = (tests ?? []).filter((t: any) => t.confidence).map((t: any) => Number(t.confidence));
    const avgScore = scores.length ? +(scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1) : 0;

    set({
      events: (events as AnalyticsEvent[]) ?? [],
      summary: {
        totalPrompts: prompts?.length ?? 0,
        totalTests: tests?.length ?? 0,
        totalCreditsUsed,
        avgScore,
        modelUsage,
        dailyActivity,
        topPrompts,
        revenueData,
      },
      loading: false,
    });
  },
}));
