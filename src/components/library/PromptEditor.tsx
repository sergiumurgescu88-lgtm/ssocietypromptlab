import { useState, useEffect } from "react";
import { X, Plus, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePromptsStore, type PromptRow, type PromptVersion } from "@/stores/prompts-store";
import { toast } from "sonner";

interface PromptEditorProps {
  open: boolean;
  onClose: () => void;
  prompt?: PromptRow | null;
}

export function PromptEditor({ open, onClose, prompt }: PromptEditorProps) {
  const { createPrompt, updatePrompt, saveVersion, fetchVersions } = usePromptsStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [model, setModel] = useState("gemini");
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [activeTab, setActiveTab] = useState("edit");

  const isEdit = !!prompt;

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setContent(prompt.content);
      setSystemPrompt(prompt.system_prompt ?? "");
      setTags(prompt.tags ?? []);
      setModel(prompt.default_model ?? "gemini");
    } else {
      setTitle(""); setContent(""); setSystemPrompt(""); setTags([]); setModel("gemini");
    }
    setActiveTab("edit");
  }, [prompt, open]);

  useEffect(() => {
    if (prompt && activeTab === "versions") {
      fetchVersions(prompt.id).then(setVersions);
    }
  }, [prompt, activeTab, fetchVersions]);

  const addTag = () => {
    const t = newTag.trim().toLowerCase();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setNewTag(""); }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) { toast.error("Title and content required"); return; }
    setSaving(true);
    if (isEdit && prompt) {
      await updatePrompt(prompt.id, { title, content, system_prompt: systemPrompt, tags, default_model: model });
      if (content !== prompt.content || systemPrompt !== (prompt.system_prompt ?? "")) {
        await saveVersion(prompt.id, content, systemPrompt);
      }
      toast.success("Prompt updated!");
    } else {
      const id = await createPrompt({ title, content, system_prompt: systemPrompt, tags, default_model: model });
      if (id) toast.success("Prompt created!");
      else toast.error("Failed to create");
    }
    setSaving(false);
    onClose();
  };

  const handleRollback = async (version: PromptVersion) => {
    setContent(version.content);
    setSystemPrompt(version.system_prompt ?? "");
    setActiveTab("edit");
    toast.success(`Rolled back to v${version.version_num}`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Prompt" : "New Prompt"}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            {isEdit && <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>}
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Prompt" />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="font-mono text-sm" placeholder="Write your prompt here..." />
            </div>

            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={2} className="text-sm" placeholder="Optional system instructions..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="mistral">Mistral</SelectItem>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-1 flex-wrap mb-1">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1 text-xs">
                      {t}
                      <button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-1">
                  <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add tag" className="text-xs" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={addTag}><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>

            <Button variant="gradient" onClick={handleSave} disabled={saving} className="w-full">
              <Save className="w-4 h-4 mr-2" />{saving ? "Saving..." : isEdit ? "Update Prompt" : "Create Prompt"}
            </Button>
          </TabsContent>

          <TabsContent value="versions" className="space-y-3">
            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No versions yet</p>
            ) : (
              versions.map((v, i) => (
                <div key={v.id} className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">v{v.version_num}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</span>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleRollback(v)}>
                      Rollback
                    </Button>
                  </div>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono line-clamp-4">{v.content}</pre>
                  {/* Simple diff indicator */}
                  {i < versions.length - 1 && v.content !== versions[i + 1]?.content && (
                    <div className="mt-2 text-[10px] flex items-center gap-2">
                      <span className="text-emerald-500">+ additions</span>
                      <span className="text-destructive">- deletions</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
