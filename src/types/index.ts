export type AIModel = "gemini" | "gpt-4" | "mistral" | "deepseek";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: "free" | "pro" | "enterprise";
  credits: number;
  apiKeys: Record<string, string>;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  model: AIModel;
  versions: number;
  category: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  tags: string[];
}

export interface TestResult {
  id: string;
  promptId: string;
  model: AIModel;
  output: string;
  tokens: number;
  latency: number;
  score: number;
  createdAt: string;
}

export interface MarketplaceItem {
  id: string;
  prompt: Prompt;
  author: { name: string; avatar?: string };
  price: number;
  downloads: number;
  rating: number;
}

export interface StatsCard {
  label: string;
  value: string | number;
  change?: number;
  icon: string;
}
