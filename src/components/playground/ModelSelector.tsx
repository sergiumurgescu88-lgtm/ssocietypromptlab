import { modelMeta } from "@/lib/ai-stream";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import type { ModelConfig } from "@/lib/ai-stream";

interface ModelSelectorProps {
  selectedModels: string[];
  onToggle: (model: string) => void;
  configs: Record<string, ModelConfig>;
  onConfigChange: (model: string, config: ModelConfig) => void;
  systemPrompt: string;
  onSystemPromptChange: (v: string) => void;
}

const models = Object.entries(modelMeta);

export function ModelSelector({
  selectedModels,
  onToggle,
  configs,
  onConfigChange,
  systemPrompt,
  onSystemPromptChange,
}: ModelSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">System Prompt</label>
        <Textarea
          value={systemPrompt}
          onChange={(e) => onSystemPromptChange(e.target.value)}
          placeholder="You are a helpful assistant..."
          className="text-xs min-h-[60px] resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Models</label>
        <div className="grid grid-cols-2 gap-2">
          {models.map(([key, meta]) => (
            <label
              key={key}
              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                selectedModels.includes(key)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <Checkbox
                checked={selectedModels.includes(key)}
                onCheckedChange={() => onToggle(key)}
              />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                <span className="text-xs font-medium text-foreground">{meta.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {models
          .filter(([key]) => selectedModels.includes(key))
          .map(([key, meta]) => {
            const config = configs[key];
            return (
              <AccordionItem key={key} value={key} className="border-border">
                <AccordionTrigger className="text-xs py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                    {meta.label} Settings
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <Label className="text-xs">Temperature</Label>
                      <span className="text-xs text-muted-foreground">{config.temperature}</span>
                    </div>
                    <Slider
                      value={[config.temperature]}
                      onValueChange={([v]) => onConfigChange(key, { ...config, temperature: v })}
                      min={0} max={2} step={0.1}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <Label className="text-xs">Max Tokens</Label>
                      <span className="text-xs text-muted-foreground">{config.maxTokens}</span>
                    </div>
                    <Slider
                      value={[config.maxTokens]}
                      onValueChange={([v]) => onConfigChange(key, { ...config, maxTokens: v })}
                      min={64} max={4096} step={64}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <Label className="text-xs">Top P</Label>
                      <span className="text-xs text-muted-foreground">{config.topP}</span>
                    </div>
                    <Slider
                      value={[config.topP]}
                      onValueChange={([v]) => onConfigChange(key, { ...config, topP: v })}
                      min={0} max={1} step={0.05}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
      </Accordion>
    </div>
  );
}
