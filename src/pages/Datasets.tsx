import { DataSourceSelector } from '@/components/datasets/DataSourceSelector';
import { ConfigPanel } from '@/components/datasets/ConfigPanel';
import { PreviewTable } from '@/components/datasets/PreviewTable';
import { ExportModal } from '@/components/datasets/ExportModal';
import { useDatasetStore } from '@/stores/dataset-store';
import { Button } from '@/components/ui/button';
import { RotateCcw, Database } from 'lucide-react';

const Datasets = () => {
  const { selectedSource, step, records, reset } = useDatasetStore();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Datasets</h1>
          <p className="text-muted-foreground text-sm">Generate training datasets from external APIs</p>
        </div>
        <div className="flex items-center gap-2">
          {step === 'ready' && <ExportModal />}
          {selectedSource && (
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Step 1: Source selection */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4" /> Select Data Source
        </h2>
        <DataSourceSelector />
      </section>

      {/* Step 2: Configuration */}
      {selectedSource && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ConfigPanel />
          </div>
          <div className="lg:col-span-2">
            <PreviewTable />
            {step === 'idle' && (
              <div className="flex items-center justify-center h-48 border border-dashed border-border rounded-xl">
                <p className="text-sm text-muted-foreground">Configure parameters and click Generate</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Stats bar when ready */}
      {step === 'ready' && records.length > 0 && (
        <div className="flex items-center gap-6 rounded-xl bg-muted/50 border border-border p-4 text-sm">
          <div><span className="font-semibold text-foreground">{records.length}</span> <span className="text-muted-foreground">records</span></div>
          <div><span className="font-semibold text-foreground">{new Set(records.map(r => r.source)).size}</span> <span className="text-muted-foreground">sources</span></div>
          <div><span className="font-semibold text-foreground">{Object.keys(records[0]?.metadata || {}).length}</span> <span className="text-muted-foreground">fields per record</span></div>
        </div>
      )}
    </div>
  );
};

export default Datasets;
