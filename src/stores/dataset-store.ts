import { create } from 'zustand';
import { CleanRecord, getDataSource } from '@/lib/data-sources';

export type PipelineStep = 'idle' | 'fetching' | 'cleaning' | 'ready' | 'exporting' | 'error';

interface DatasetState {
  selectedSource: string | null;
  sourceParams: Record<string, any>;
  records: CleanRecord[];
  rawCount: number;
  step: PipelineStep;
  error: string | null;
  progress: number;

  selectSource: (id: string) => void;
  setParam: (key: string, value: any) => void;
  generate: () => Promise<void>;
  reset: () => void;
  exportData: (format: 'json' | 'csv') => void;
}

export const useDatasetStore = create<DatasetState>((set, get) => ({
  selectedSource: null,
  sourceParams: {},
  records: [],
  rawCount: 0,
  step: 'idle',
  error: null,
  progress: 0,

  selectSource(id) {
    const source = getDataSource(id);
    if (!source) return;
    const defaults: Record<string, any> = {};
    source.config.fields.forEach(f => {
      if (f.default !== undefined) defaults[f.key] = f.default;
    });
    set({ selectedSource: id, sourceParams: defaults, records: [], step: 'idle', error: null, progress: 0 });
  },

  setParam(key, value) {
    set(s => ({ sourceParams: { ...s.sourceParams, [key]: value } }));
  },

  async generate() {
    const { selectedSource, sourceParams } = get();
    if (!selectedSource) return;
    const source = getDataSource(selectedSource);
    if (!source) return;

    set({ step: 'fetching', error: null, progress: 10 });

    try {
      const result = await source.fetch(sourceParams);
      set({ progress: 50, step: 'cleaning', rawCount: result.total });

      // Simulate cleaning step
      await new Promise(r => setTimeout(r, 400));
      const cleaned = source.transform(result.records);

      // Deduplicate by text
      const seen = new Set<string>();
      const deduped = cleaned.filter(r => {
        const key = r.text.slice(0, 100);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      set({ records: deduped, step: 'ready', progress: 100 });
    } catch (err: any) {
      set({ step: 'error', error: err.message || 'Failed to generate dataset', progress: 0 });
    }
  },

  reset() {
    set({ selectedSource: null, sourceParams: {}, records: [], rawCount: 0, step: 'idle', error: null, progress: 0 });
  },

  exportData(format) {
    const { records, selectedSource } = get();
    if (!records.length) return;

    set({ step: 'exporting' });

    let content: string;
    let mime: string;
    let ext: string;

    if (format === 'csv') {
      const headers = ['id', 'text', 'source', 'timestamp', ...Object.keys(records[0]?.metadata || {})];
      const rows = records.map(r => {
        const base = [r.id, `"${r.text.replace(/"/g, '""').replace(/\n/g, '\\n')}"`, r.source, r.timestamp];
        const meta = Object.values(r.metadata).map(v =>
          `"${String(Array.isArray(v) ? v.join(';') : v).replace(/"/g, '""')}"`
        );
        return [...base, ...meta].join(',');
      });
      content = [headers.join(','), ...rows].join('\n');
      mime = 'text/csv';
      ext = 'csv';
    } else {
      const manifest = {
        source: selectedSource,
        generatedAt: new Date().toISOString(),
        totalRecords: records.length,
        schema: { id: 'string', text: 'string', metadata: 'object', source: 'string', timestamp: 'string' },
      };
      content = JSON.stringify({ manifest, data: records }, null, 2);
      mime = 'application/json';
      ext = 'json';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dataset-${selectedSource}-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);

    set({ step: 'ready' });
  },
}));
