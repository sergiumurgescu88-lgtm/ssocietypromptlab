import { Edit, Trash2, Play, Star, Clock, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { modelMeta } from "@/lib/ai-stream";
import type { PromptRow } from "@/stores/prompts-store";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  testing: "bg-amber-500/10 text-amber-500",
  published: "bg-emerald-500/10 text-emerald-500",
};

interface PromptCardProps {
  prompt: PromptRow;
  viewMode: "grid" | "list";
  onEdit: () => void;
  onTest: () => void;
  onDelete: () => void;
}

export function PromptCard({ prompt, viewMode, onEdit, onTest, onDelete }: PromptCardProps) {
  const meta = modelMeta[prompt.default_model ?? "gemini"];
  const isGrid = viewMode === "grid";

  return (
    <Card className={`card-hover border-border group ${isGrid ? "" : "flex items-center"}`}>
      <CardContent className={`p-4 ${isGrid ? "" : "flex items-center gap-4 w-full"}`}>
        <div className={`${isGrid ? "" : "flex-1"} min-w-0`}>
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-sm font-semibold text-foreground truncate">{prompt.title}</h3>
            <Badge className={`text-[10px] px-1.5 py-0 capitalize ${statusColors[prompt.status ?? "draft"]}`}>
              {prompt.status}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{prompt.content}</p>

          <div className="flex flex-wrap gap-1 mb-2">
            {(prompt.tags ?? []).slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
            ))}
            {(prompt.tags ?? []).length > 3 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{(prompt.tags ?? []).length - 3}</Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {meta && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                {meta.label}
              </span>
            )}
            <span className="flex items-center gap-1"><Play className="w-3 h-3" />{prompt.uses ?? 0} uses</span>
            <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{prompt.win_rate ?? 0}% win</span>
          </div>
        </div>

        <div className={`flex items-center gap-1 ${isGrid ? "mt-3 pt-2 border-t border-border" : "flex-shrink-0"}`}>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onTest}>
            <Play className="w-3 h-3" /> Test
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onEdit}>
            <Edit className="w-3 h-3" /> Edit
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
