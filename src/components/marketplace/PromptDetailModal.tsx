import { Star, Download, Shield, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { MarketplacePrompt } from "@/stores/marketplace-store";

interface Props {
  item: MarketplacePrompt | null;
  open: boolean;
  onClose: () => void;
  onPurchase: (id: string) => void;
  purchased?: boolean;
  purchasing?: boolean;
}

export function PromptDetailModal({ item, open, onClose, onPurchase, purchased, purchasing }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const blurredContent = !purchased && item.price > 0;

  const handleCopy = () => {
    if (blurredContent) return;
    navigator.clipboard.writeText(item.content_preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">{item.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{item.description}</p>

          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-500" /> {Number(item.rating).toFixed(1)}
              <span className="text-muted-foreground">({item.ratings_count})</span>
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Download className="w-4 h-4" /> {item.sales_count} sales
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(item.tags ?? []).map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
            ))}
          </div>

          <Separator />

          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prompt Preview</span>
              <Button variant="ghost" size="sm" onClick={handleCopy} disabled={blurredContent}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
            <Textarea
              readOnly
              value={item.content_preview}
              className={`min-h-[120px] resize-none text-sm ${blurredContent ? "blur-sm select-none" : ""}`}
            />
            {blurredContent && (
              <div className="absolute inset-0 flex items-center justify-center mt-6">
                <div className="bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 border border-border">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Purchase to unlock full prompt</span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              {item.price > 0 ? (
                <div>
                  <span className="text-2xl font-bold text-foreground">${item.price}</span>
                  <span className="text-xs text-muted-foreground ml-1">one-time</span>
                </div>
              ) : (
                <Badge variant="secondary" className="text-sm">Free</Badge>
              )}
            </div>
            {purchased ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-sm px-4 py-1.5">
                ✓ Owned
              </Badge>
            ) : (
              <Button
                variant="gradient"
                onClick={() => onPurchase(item.id)}
                disabled={purchasing}
              >
                {purchasing ? "Processing..." : item.price > 0 ? "Buy Now" : "Get Free"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
