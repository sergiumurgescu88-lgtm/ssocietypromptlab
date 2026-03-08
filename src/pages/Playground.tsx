import { useState, useRef, useCallback } from "react";
import { PromptInput } from "@/components/playground/PromptInput";
import { ModelSelector } from "@/components/playground/ModelSelector";
import { OutputCard } from "@/components/playground/OutputCard";
import { streamPrompt, defaultModelConfig, type ModelConfig, type RunResult } from "@/lib/ai-stream";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/integrations/supabase/client";
import { Save, FlaskConical, Download, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Playground = () => {
  const [prompt, setPrompt] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>(["gemini", "gpt-4"]);
  const [configs, setConfigs] = useState<Record<string, ModelConfig>>({
    gemini: { ...defaultModelConfig },
    "gpt-4": { ...defaultModelConfig },
    mistral: { ...defaultModelConfig },
    deepseek: { ...defaultModelConfig },
  });
  const [results, setResults] = useState<Record<string, RunResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { profile } = useAuthStore();

  const toggleModel = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const updateConfig = (model: string, config: ModelConfig) => {
    setConfigs((prev) => ({ ...prev, [model]: config }));
  };

  const resolvePrompt = () => {
    return prompt.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
  };

  const handleRun = useCallback(async () => {
    if (!prompt.trim() || selectedModels.length === 0) return;

    // Check credits
    if (profile && profile.credits < selectedModels.length) {
      toast.error("Not enough credits");
      return;
    }

    setIsRunning(true);
    const resolvedPrompt = resolvePrompt();
    const controller = new AbortController();
    abortRef.current = controller;

    // Initialize results
    const initialResults: Record<string, RunResult> = {};
    selectedModels.forEach((m) => {
      initialResults[m] = { model: m, output: "", tokens: 0, latency: 0, status: "loading" };
    });
    setResults(initialResults);

    const startTime = performance.now();

    // Run all models in parallel
    const promises = selectedModels.map(async (model) => {
      const modelStart = performance.now();

      await streamPrompt({
        prompt: resolvedPrompt,
        model,
        systemPrompt: systemPrompt || undefined,
        config: configs[model],
        signal: controller.signal,
        onDelta: (text) => {
          setResults((prev) => ({
            ...prev,
            [model]: {
              ...prev[model],
              output: prev[model].output + text,
              status: "streaming",
              latency: (performance.now() - modelStart) / 1000,
            },
          }));
        },
        onDone: (tokens) => {
          setResults((prev) => ({
            ...prev,
            [model]: {
              ...prev[model],
              tokens,
              latency: (performance.now() - modelStart) / 1000,
              status: "done",
            },
          }));
        },
        onError: (err) => {
          setResults((prev) => ({
            ...prev,
            [model]: {
              ...prev[model],
              error: err,
              status: "error",
              latency: (performance.now() - modelStart) / 1000,
            },
          }));
        },
      });
    });

    await Promise.allSettled(promises);

    // Deduct credits
    if (profile) {
      await supabase
        .from("profiles")
        .update({ credits: Math.max(0, profile.credits - selectedModels.length) })
        .eq("user_id", profile.user_id);
      useAuthStore.getState().fetchProfile();
    }

    setIsRunning(false);
    abortRef.current = null;
  }, [prompt, selectedModels, configs, systemPrompt, variables, profile]);

  const handleStop = () => {
    abortRef.current?.abort();
    setIsRunning(false);
  };

  const hasResults = Object.keys(results).length > 0;
  const allDone = hasResults && Object.values(results).every((r) => r.status === "done" || r.status === "error");

  // Dynamic grid columns based on model count
  const gridCols =
    selectedModels.length <= 1 ? "grid-cols-1"
    : selectedModels.length === 2 ? "grid-cols-1 lg:grid-cols-2"
    : selectedModels.length === 3 ? "grid-cols-1 lg:grid-cols-3"
    : "grid-cols-1 md:grid-cols-2";

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Playground</h1>
        <p className="text-muted-foreground text-sm">Test prompts across AI models with real-time streaming</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Left: Input panel */}
        <div className="w-full lg:w-[380px] lg:flex-shrink-0 space-y-4 overflow-auto">
          <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onRun={handleRun}
              isRunning={isRunning}
              variables={variables}
              onVariablesChange={setVariables}
            />
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <ModelSelector
              selectedModels={selectedModels}
              onToggle={toggleModel}
              configs={configs}
              onConfigChange={updateConfig}
              systemPrompt={systemPrompt}
              onSystemPromptChange={setSystemPrompt}
            />
          </div>
        </div>

        {/* Right: Output panel */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {isRunning && (
            <div className="flex justify-end">
              <Button variant="destructive" size="sm" onClick={handleStop} className="gap-1.5">
                <StopCircle className="w-4 h-4" /> Stop All
              </Button>
            </div>
          )}

          {hasResults ? (
            <div className={`grid ${gridCols} gap-4 flex-1`}>
              {selectedModels.map((model) => {
                const result = results[model];
                if (!result) return null;
                return <OutputCard key={model} result={result} />;
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center border border-dashed border-border rounded-xl">
              <div className="text-center text-muted-foreground">
                <FlaskConical className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Select models and run a prompt to see results</p>
                <p className="text-xs mt-1 opacity-60">⌘+Enter to run</p>
              </div>
            </div>
          )}

          {/* Compare Bar */}
          {allDone && (
            <div className="sticky bottom-0 bg-card border border-border rounded-xl p-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {Object.values(results).filter((r) => r.status === "done").length} model(s) completed
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => toast.success("Results exported!")}>
                  <Download className="w-3.5 h-3.5" /> Export
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => toast.success("A/B Test created!")}>
                  <FlaskConical className="w-3.5 h-3.5" /> A/B Test
                </Button>
                <Button variant="gradient" size="sm" className="text-xs gap-1.5" onClick={() => toast.success("Saved!")}>
                  <Save className="w-3.5 h-3.5" /> Save Best
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playground;
