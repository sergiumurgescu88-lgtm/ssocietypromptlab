import { useState, useRef, useEffect } from "react";
import { Send, Wand2, FileText, Code, Pencil, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const templates = [
  { label: "Email Writer", icon: MessageSquare, content: "Write a professional email about {{topic}}. Tone: {{tone}}. Keep it concise." },
  { label: "Code Generator", icon: Code, content: "Write {{language}} code that {{task}}. Include comments and error handling." },
  { label: "Creative Writing", icon: Pencil, content: "Write a {{format}} about {{subject}}. Style: {{style}}. Length: {{length}}." },
  { label: "Summarizer", icon: FileText, content: "Summarize the following text in {{sentences}} sentences:\n\n{{text}}" },
];

interface PromptInputProps {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
  isRunning: boolean;
  variables: Record<string, string>;
  onVariablesChange: (v: Record<string, string>) => void;
}

export function PromptInput({ value, onChange, onRun, isRunning, variables, onVariablesChange }: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 300) + "px";
    }
  }, [value]);

  // Extract variables from prompt
  const extractedVars = Array.from(value.matchAll(/\{\{(\w+)\}\}/g)).map((m) => m[1]);
  const uniqueVars = [...new Set(extractedVars)];

  const handleTemplate = (content: string) => {
    onChange(content);
    // Extract and init variables
    const vars = Array.from(content.matchAll(/\{\{(\w+)\}\}/g)).map((m) => m[1]);
    const newVars: Record<string, string> = {};
    vars.forEach((v) => { newVars[v] = variables[v] || ""; });
    onVariablesChange(newVars);
  };

  const resolvedPrompt = value.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Prompt</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{value.length} chars</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Wand2 className="w-3.5 h-3.5" /> Templates
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {templates.map((t) => (
                <DropdownMenuItem key={t.label} onClick={() => handleTemplate(t.content)}>
                  <t.icon className="w-4 h-4 mr-2" /> {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your prompt here... Use {{variable}} for dynamic values"
        className="min-h-[120px] font-mono text-sm resize-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onRun();
          }
        }}
      />

      {uniqueVars.length > 0 && (
        <div className="space-y-2 p-3 rounded-lg bg-secondary">
          <p className="text-xs font-medium text-muted-foreground">Variables</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {uniqueVars.map((v) => (
              <div key={v} className="flex items-center gap-2">
                <span className="text-xs font-mono text-primary min-w-[80px]">{`{{${v}}}`}</span>
                <input
                  className="flex-1 text-xs px-2 py-1.5 rounded-md bg-background border border-input text-foreground"
                  placeholder={`Value for ${v}`}
                  value={variables[v] || ""}
                  onChange={(e) => onVariablesChange({ ...variables, [v]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <Button variant="gradient" onClick={onRun} disabled={isRunning || !value.trim()} className="w-full">
        <Send className="w-4 h-4 mr-2" />
        {isRunning ? "Running..." : "Run Prompt"} 
        <span className="ml-1 text-xs opacity-70">⌘↵</span>
      </Button>
    </div>
  );
}
