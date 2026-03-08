import { User, Prompt, TestResult, StatsCard, MarketplaceItem } from "@/types";

export const mockUser: User = {
  id: "1",
  name: "Alex",
  email: "alex@promptlab.ai",
  plan: "free",
  credits: 50,
  apiKeys: {},
};

export const mockPrompts: Prompt[] = [
  {
    id: "p1",
    title: "Email Writer Pro",
    content: "Write a professional email for {context}. Tone: {tone}. Length: {length}.",
    model: "gemini",
    versions: 3,
    category: "Business",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-07T14:30:00Z",
    isFavorite: true,
    tags: ["email", "business", "professional"],
  },
  {
    id: "p2",
    title: "Code Reviewer",
    content: "Review the following code for bugs, performance issues, and best practices:\n```\n{code}\n```",
    model: "gpt-4",
    versions: 5,
    category: "Development",
    createdAt: "2026-02-20T08:00:00Z",
    updatedAt: "2026-03-06T09:15:00Z",
    isFavorite: false,
    tags: ["code", "review", "development"],
  },
  {
    id: "p3",
    title: "Blog Post Generator",
    content: "Generate an SEO-optimized blog post about {topic}. Include H2 headings, meta description, and CTA.",
    model: "mistral",
    versions: 2,
    category: "Content",
    createdAt: "2026-03-03T12:00:00Z",
    updatedAt: "2026-03-08T11:00:00Z",
    isFavorite: true,
    tags: ["blog", "seo", "content"],
  },
  {
    id: "p4",
    title: "Data Analyst Assistant",
    content: "Analyze the following dataset and provide insights, trends, and actionable recommendations:\n{data}",
    model: "deepseek",
    versions: 1,
    category: "Analytics",
    createdAt: "2026-03-05T16:00:00Z",
    updatedAt: "2026-03-07T18:00:00Z",
    isFavorite: false,
    tags: ["data", "analytics", "insights"],
  },
  {
    id: "p5",
    title: "Customer Support Bot",
    content: "You are a helpful customer support agent for {company}. Respond to: {query}",
    model: "gemini",
    versions: 4,
    category: "Support",
    createdAt: "2026-02-28T09:00:00Z",
    updatedAt: "2026-03-06T15:45:00Z",
    isFavorite: false,
    tags: ["support", "chatbot", "customer"],
  },
];

export const mockTestResults: TestResult[] = [
  { id: "t1", promptId: "p1", model: "gemini", output: "Dear Mr. Johnson,\n\nI hope this email finds you well...", tokens: 234, latency: 1.2, score: 8.5, createdAt: "2026-03-07T14:30:00Z" },
  { id: "t2", promptId: "p1", model: "gpt-4", output: "Subject: Partnership Proposal\n\nHello Mr. Johnson...", tokens: 312, latency: 2.1, score: 9.0, createdAt: "2026-03-07T14:31:00Z" },
  { id: "t3", promptId: "p2", model: "gpt-4", output: "Code Review Summary:\n1. Line 23: Potential null pointer...", tokens: 456, latency: 3.4, score: 9.2, createdAt: "2026-03-06T09:15:00Z" },
];

export const mockStats: StatsCard[] = [
  { label: "Total Prompts", value: 47, change: 12, icon: "FileText" },
  { label: "Tests Run", value: 156, change: 23, icon: "FlaskConical" },
  { label: "Avg. Score", value: "8.7", change: 0.3, icon: "TrendingUp" },
  { label: "Credits Left", value: 50, change: -15, icon: "Coins" },
];

export const mockMarketplace: MarketplaceItem[] = [
  {
    id: "m1",
    prompt: mockPrompts[0],
    author: { name: "Sarah Chen" },
    price: 5,
    downloads: 1240,
    rating: 4.8,
  },
  {
    id: "m2",
    prompt: mockPrompts[1],
    author: { name: "Marcus Dev" },
    price: 0,
    downloads: 3420,
    rating: 4.9,
  },
];

export const modelColors: Record<string, string> = {
  gemini: "hsl(210, 100%, 56%)",
  "gpt-4": "hsl(152, 69%, 45%)",
  mistral: "hsl(32, 95%, 55%)",
  deepseek: "hsl(270, 70%, 60%)",
};

export const modelLabels: Record<string, string> = {
  gemini: "Gemini",
  "gpt-4": "GPT-4",
  mistral: "Mistral",
  deepseek: "DeepSeek",
};
