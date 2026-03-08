import { Copy, Save, Star, Loader2, AlertCircle, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { modelMeta, type RunResult } from "@/lib/ai-stream";

interface OutputCardProps {
  result: RunResult;
}

export function OutputCard({ result }: OutputCardProps) {
  const meta = modelMeta[result.model] || { label: result.model, color: "#888", borderClass: "border-l-muted" };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.output);
    toast.success("Copied to clipboard");
  };

  return (
    <Card className={`border-border border-l-4 ${meta.borderClass} overflow-hidden`}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
            <span className="text-sm font-semibold text-foreground">{meta.label}</span>
            {(result.status === "loading" || result.status === "streaming") && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            )}
          </div>
          {result.status === "done" && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{result.latency.toFixed(1)}s</span>
              <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{result.tokens} tok</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {result.status === "idle" && (
          <p className="text-sm text-muted-foreground italic">Waiting to run...</p>
        )}

        {result.status === "loading" && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}

        {(result.status === "streaming" || result.status === "done") && result.output && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {result.output}
              {result.status === "streaming" && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse-glow ml-0.5 align-text-bottom" />}
            </div>
          </div>
        )}

        {result.status === "error" && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{result.error || "Unknown error"}</span>
          </div>
        )}

        {result.status === "done" && result.output && (
          <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleCopy}>
              <Copy className="w-3 h-3" /> Copy
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => toast.success("Saved!")}>
              <Save className="w-3 h-3" /> Save
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => toast.success("Scored!")}>
              <Star className="w-3 h-3" /> Score
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
