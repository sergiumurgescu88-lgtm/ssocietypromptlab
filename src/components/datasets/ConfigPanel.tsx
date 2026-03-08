import { getDataSource } from '@/lib/data-sources';
import { useDatasetStore } from '@/stores/dataset-store';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';

export function ConfigPanel() {
  const { selectedSource, sourceParams, setParam, generate, step } = useDatasetStore();
  const source = selectedSource ? getDataSource(selectedSource) : null;

  if (!source) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
        Select a data source to configure
      </div>
    );
  }

  const loading = step === 'fetching' || step === 'cleaning';

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground">Configure {source.config.name}</h3>

      {source.config.fields.map(field => (
        <div key={field.key} className="space-y-2">
          <Label className="text-sm">{field.label}</Label>

          {field.type === 'select' && field.options && (
            <Select value={sourceParams[field.key] || field.default} onValueChange={v => setParam(field.key, v)}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                {field.options.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type === 'number' && (
            <div className="flex items-center gap-3">
              <Slider
                min={field.min || 10}
                max={field.max || 500}
                step={10}
                value={[sourceParams[field.key] || field.default || 50]}
                onValueChange={([v]) => setParam(field.key, v)}
                className="flex-1"
              />
              <span className="text-sm font-mono text-muted-foreground w-12 text-right">
                {sourceParams[field.key] || field.default || 50}
              </span>
            </div>
          )}
        </div>
      ))}

      <Button onClick={generate} disabled={loading} className="w-full gradient-primary text-primary-foreground">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <><Play className="w-4 h-4 mr-2" />Generate Dataset</>}
      </Button>
    </div>
  );
}
