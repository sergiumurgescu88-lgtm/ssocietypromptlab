import { useState, useEffect } from "react";
import { useApiKeysStore } from "@/stores/api-keys-store";
import { Key, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ApiProvider = Database["public"]["Enums"]["api_provider"];

const providers: { value: ApiProvider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "gemini", label: "Google Gemini" },
  { value: "mistral", label: "Mistral AI" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "anthropic", label: "Anthropic" },
];

export function ApiKeysManager() {
  const { keys, loading, fetchKeys, addKey, removeKey } = useApiKeysStore();
  const [provider, setProvider] = useState<ApiProvider>("openai");
  const [keyValue, setKeyValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleAdd = async () => {
    if (!keyValue.trim()) return;
    setSaving(true);
    const { error } = await addKey(provider, keyValue);
    setSaving(false);
    if (error) toast.error(error);
    else { toast.success(`${provider} key saved!`); setKeyValue(""); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await removeKey(id);
    if (error) toast.error(error);
    else toast.success("Key removed");
  };

  const toggleVisible = (id: string) => {
    const next = new Set(visibleKeys);
    if (next.has(id)) next.delete(id); else next.add(id);
    setVisibleKeys(next);
  };

  const maskKey = (key: string) => key.slice(0, 8) + "••••••••" + key.slice(-4);

  return (
    <Card className="border-border">
      <CardHeader><CardTitle className="flex items-center gap-2"><Key className="w-5 h-5" /> API Keys</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {keys.length > 0 && (
          <div className="space-y-2">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className="capitalize flex-shrink-0">{k.provider}</Badge>
                  <span className="text-xs text-muted-foreground font-mono truncate">
                    {visibleKeys.has(k.id) ? k.encrypted_key : maskKey(k.encrypted_key)}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleVisible(k.id)}>
                    {visibleKeys.has(k.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(k.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 pt-2 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Provider</Label>
              <Select value={provider} onValueChange={(v) => setProvider(v as ApiProvider)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {providers.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">API Key</Label>
              <Input type="password" placeholder="sk-..." value={keyValue} onChange={(e) => setKeyValue(e.target.value)} />
            </div>
          </div>
          <Button variant="gradient" onClick={handleAdd} disabled={saving || !keyValue.trim()} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Add Key"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
