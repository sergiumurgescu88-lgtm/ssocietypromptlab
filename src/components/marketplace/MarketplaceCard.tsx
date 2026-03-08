import { Star, Download, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MarketplacePrompt } from "@/stores/marketplace-store";

const modelColors: Record<string, string> = {
  gemini: "bg-blue-500/10 text-blue-500",
  "gpt-4": "bg-emerald-500/10 text-emerald-500",
  mistral: "bg-amber-500/10 text-amber-500",
  deepseek: "bg-accent/10 text-accent",
};

interface Props {
  item: MarketplacePrompt;
  onView: (item: MarketplacePrompt) => void;
  purchased?: boolean;
}

export function MarketplaceCard({ item, onView, purchased }: Props) {
  return (
    <Card
      className="card-hover border-border cursor-pointer group overflow-hidden"
      onClick={() => onView(item)}
    >
      {/* Color bar */}
      <div className="h-1.5 gradient-primary" />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          {item.price > 0 ? (
            <span className="text-sm font-bold text-primary whitespace-nowrap">${item.price}</span>
          ) : (
            <Badge variant="secondary" className="text-xs whitespace-nowrap">Free</Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">{item.description || item.content_preview}</p>

        <div className="flex flex-wrap gap-1">
          {(item.model_compatibility ?? []).slice(0, 3).map((m) => (
            <Badge key={m} variant="outline" className={`text-[10px] px-1.5 py-0 ${modelColors[m] || ""}`}>
              {m}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              {Number(item.rating).toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {item.sales_count}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {item.category}
          </div>
        </div>

        {purchased && (
          <Badge className="w-full justify-center bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">
            ✓ Purchased
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
