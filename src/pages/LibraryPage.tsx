import { useState, useEffect, useMemo, useCallback } from "react";
import { usePromptsStore, type PromptRow } from "@/stores/prompts-store";
import { PromptCard } from "@/components/library/PromptCard";
import { PromptEditor } from "@/components/library/PromptEditor";
import { Search, Plus, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const LibraryPage = () => {
  const store = usePromptsStore();
  const { prompts, loading, search, filterModel, filterTag, sortBy, sortDir, viewMode } = store;
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptRow | null>(null);
  const [searchInput, setSearchInput] = useState(search);
  const navigate = useNavigate();

  useEffect(() => { store.fetchPrompts(); }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => store.setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // All unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    prompts.forEach((p) => (p.tags ?? []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [prompts]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...prompts];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filterModel !== "all") list = list.filter((p) => p.default_model === filterModel);
    if (filterTag !== "all") list = list.filter((p) => (p.tags ?? []).includes(filterTag));

    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "title") cmp = a.title.localeCompare(b.title);
      else if (sortBy === "uses") cmp = (a.uses ?? 0) - (b.uses ?? 0);
      else if (sortBy === "win_rate") cmp = (a.win_rate ?? 0) - (b.win_rate ?? 0);
      else if (sortBy === "created_at") cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      return sortDir === "desc" ? -cmp : cmp;
    });
    return list;
  }, [prompts, search, filterModel, filterTag, sortBy, sortDir]);

  const handleEdit = (p: PromptRow) => { setEditingPrompt(p); setEditorOpen(true); };
  const handleNew = () => { setEditingPrompt(null); setEditorOpen(true); };
  const handleDelete = async (id: string) => {
    await store.deletePrompt(id);
    toast.success("Prompt deleted");
  };
  const handleTest = (p: PromptRow) => navigate("/playground");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prompt Library</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} prompt{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="gradient" onClick={handleNew} className="gap-1.5">
          <Plus className="w-4 h-4" /> New Prompt
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search prompts..."
            className="pl-10"
          />
        </div>

        <Select value={filterModel} onValueChange={store.setFilterModel}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Model" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            <SelectItem value="gemini">Gemini</SelectItem>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="mistral">Mistral</SelectItem>
            <SelectItem value="deepseek">DeepSeek</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterTag} onValueChange={store.setFilterTag}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Tag" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {allTags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => store.setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[140px]"><SlidersHorizontal className="w-3.5 h-3.5 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">Last Updated</SelectItem>
            <SelectItem value="created_at">Created</SelectItem>
            <SelectItem value="title">Name</SelectItem>
            <SelectItem value="uses">Most Used</SelectItem>
            <SelectItem value="win_rate">Win Rate</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex border border-border rounded-md overflow-hidden">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-none"
            onClick={() => store.setViewMode("grid")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-none"
            onClick={() => store.setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[160px] rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-subtle flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-primary opacity-40" />
          </div>
          <p className="text-muted-foreground text-sm">
            {prompts.length === 0 ? "No prompts yet. Create your first one!" : "No prompts match your filters."}
          </p>
          {prompts.length === 0 && (
            <Button variant="gradient" onClick={handleNew} className="mt-4 gap-1.5">
              <Plus className="w-4 h-4" /> Create Prompt
            </Button>
          )}
        </div>
      ) : (
        <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {filtered.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              viewMode={viewMode}
              onEdit={() => handleEdit(p)}
              onTest={() => handleTest(p)}
              onDelete={() => handleDelete(p.id)}
            />
          ))}
        </div>
      )}

      <PromptEditor open={editorOpen} onClose={() => setEditorOpen(false)} prompt={editingPrompt} />
    </div>
  );
};

export default LibraryPage;
