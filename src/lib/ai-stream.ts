export interface ModelConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
}

export interface RunResult {
  model: string;
  output: string;
  tokens: number;
  latency: number;
  error?: string;
  status: "idle" | "loading" | "streaming" | "done" | "error";
}

export const defaultModelConfig: ModelConfig = {
  temperature: 0.7,
  maxTokens: 1024,
  topP: 0.9,
};

export const modelMeta: Record<string, { label: string; color: string; borderClass: string }> = {
  gemini: { label: "Gemini", color: "hsl(239 84% 67%)", borderClass: "border-l-primary" },
  "gpt-4": { label: "GPT-4", color: "hsl(152 69% 45%)", borderClass: "border-l-emerald-500" },
  mistral: { label: "Mistral", color: "hsl(32 95% 55%)", borderClass: "border-l-orange-500" },
  deepseek: { label: "DeepSeek", color: "hsl(270 70% 60%)", borderClass: "border-l-accent" },
};

const STREAM_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/run-prompt`;

export async function streamPrompt({
  prompt,
  model,
  systemPrompt,
  config,
  onDelta,
  onDone,
  onError,
  signal,
}: {
  prompt: string;
  model: string;
  systemPrompt?: string;
  config: ModelConfig;
  onDelta: (text: string) => void;
  onDone: (tokens: number) => void;
  onError: (err: string) => void;
  signal?: AbortSignal;
}) {
  const start = performance.now();

  try {
    const resp = await fetch(STREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        model,
        systemPrompt,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      }),
      signal,
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }));
      onError(err.error || `Error ${resp.status}`);
      return;
    }

    if (!resp.body) {
      onError("No response body");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let totalTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          const latency = (performance.now() - start) / 1000;
          onDone(totalTokens);
          return;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          const usage = parsed.usage;
          if (content) {
            onDelta(content);
            totalTokens += 1; // approximate token count
          }
          if (usage?.total_tokens) totalTokens = usage.total_tokens;
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    onDone(totalTokens);
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") {
      onError("Request cancelled");
    } else {
      onError(e instanceof Error ? e.message : "Unknown error");
    }
  }
}
