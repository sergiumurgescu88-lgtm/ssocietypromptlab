import { useEffect, useState, useMemo } from "react";
import { Store, Search, Plus, LayoutGrid, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketplaceStore } from "@/stores/marketplace-store";
import { MarketplaceCard } from "@/components/marketplace/MarketplaceCard";
import { PromptDetailModal } from "@/components/marketplace/PromptDetailModal";
import { CreatorDashboard } from "@/components/marketplace/CreatorDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarketplacePrompt } from "@/stores/marketplace-store";

const categories = ["all", "business", "development", "content", "analytics", "support", "creative", "general"];

const Marketplace = () => {
  const { toast } = useToast();
  const { session } = useAuthStore();
  const userId = session?.user?.id;
  const {
    listings, myPurchases, loading,
    search, categoryFilter, modelFilter, sortBy,
    setSearch, setCategoryFilter, setModelFilter, setSortBy,
    fetchListings, fetchMyListings, fetchMyPurchases, fetchMySales,
    publishPrompt, purchasePrompt,
  } = useMarketplaceStore();

  const [selectedItem, setSelectedItem] = useState<MarketplacePrompt | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [newListing, setNewListing] = useState({ title: "", description: "", content_preview: "", price: "0", category: "general", tags: "" });

  useEffect(() => {
    fetchListings();
    if (userId) {
      fetchMyListings(userId);
      fetchMyPurchases(userId);
      fetchMySales(userId);
    }
  }, [userId]);

  const purchasedIds = useMemo(() => new Set(myPurchases.map((p) => p.marketplace_prompt_id)), [myPurchases]);

  const filtered = useMemo(() => {
    let result = listings;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || (l.tags ?? []).some((t) => t.toLowerCase().includes(q)));
    }
    if (categoryFilter !== "all") result = result.filter((l) => l.category === categoryFilter);
    if (modelFilter !== "all") result = result.filter((l) => (l.model_compatibility ?? []).includes(modelFilter));

    switch (sortBy) {
      case "popular": result = [...result].sort((a, b) => b.sales_count - a.sales_count); break;
      case "rating": result = [...result].sort((a, b) => Number(b.rating) - Number(a.rating)); break;
      case "price_low": result = [...result].sort((a, b) => Number(a.price) - Number(b.price)); break;
      case "price_high": result = [...result].sort((a, b) => Number(b.price) - Number(a.price)); break;
      default: break;
    }
    return result;
  }, [listings, search, categoryFilter, modelFilter, sortBy]);

  const handlePurchase = async (id: string) => {
    if (!userId) return;
    setPurchasing(true);
    try {
      await purchasePrompt(id, userId);
      toast({ title: "Purchase successful!", description: "The prompt is now in your library." });
      setSelectedItem(null);
    } catch {
      toast({ title: "Purchase failed", variant: "destructive" });
    } finally {
      setPurchasing(false);
    }
  };

  const handlePublish = async () => {
    if (!userId || !newListing.title) return;
    await publishPrompt({
      creator_id: userId,
      title: newListing.title,
      description: newListing.description,
      content_preview: newListing.content_preview,
      price: Number(newListing.price) || 0,
      category: newListing.category,
      tags: newListing.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setPublishOpen(false);
    setNewListing({ title: "", description: "", content_preview: "", price: "0", category: "general", tags: "" });
    fetchMyListings(userId);
    toast({ title: "Prompt published to marketplace!" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground text-sm">Browse & sell prompts</p>
        </div>
        <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" size="sm"><Plus className="w-4 h-4 mr-1" /> Publish Prompt</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Publish to Marketplace</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={newListing.title} onChange={(e) => setNewListing((p) => ({ ...p, title: e.target.value }))} /></div>
              <div><Label>Description</Label><Textarea value={newListing.description} onChange={(e) => setNewListing((p) => ({ ...p, description: e.target.value }))} /></div>
              <div><Label>Prompt Content (preview)</Label><Textarea value={newListing.content_preview} onChange={(e) => setNewListing((p) => ({ ...p, content_preview: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Price ($)</Label><Input type="number" min="0" value={newListing.price} onChange={(e) => setNewListing((p) => ({ ...p, price: e.target.value }))} /></div>
                <div>
                  <Label>Category</Label>
                  <Select value={newListing.category} onValueChange={(v) => setNewListing((p) => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.filter((c) => c !== "all").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Tags (comma-separated)</Label><Input value={newListing.tags} onChange={(e) => setNewListing((p) => ({ ...p, tags: e.target.value }))} placeholder="email, marketing, sales" /></div>
              <Button variant="gradient" className="w-full" onClick={handlePublish}>Publish</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse"><LayoutGrid className="w-4 h-4 mr-1" /> Browse</TabsTrigger>
          <TabsTrigger value="creator"><User className="w-4 h-4 mr-1" /> Creator</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search prompts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All Categories" : c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Model" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="mistral">Mistral</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="price_low">Price: Low→High</SelectItem>
                <SelectItem value="price_high">Price: High→Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-xl">
              <Store className="w-10 h-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No prompts found. Be the first to publish!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <MarketplaceCard key={item.id} item={item} onView={setSelectedItem} purchased={purchasedIds.has(item.id)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="creator" className="mt-4">
          <CreatorDashboard />
        </TabsContent>
      </Tabs>

      <PromptDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onPurchase={handlePurchase}
        purchased={selectedItem ? purchasedIds.has(selectedItem.id) : false}
        purchasing={purchasing}
      />
    </div>
  );
};

export default Marketplace;
