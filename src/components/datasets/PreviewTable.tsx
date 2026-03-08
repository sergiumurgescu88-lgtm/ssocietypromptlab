import { useDatasetStore } from '@/stores/dataset-store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useState, useMemo } from 'react';

export function PreviewTable() {
  const { records, step } = useDatasetStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const perPage = 10;

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter(r => r.text.toLowerCase().includes(q) || r.source.toLowerCase().includes(q));
  }, [records, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRecords = filtered.slice(page * perPage, (page + 1) * perPage);

  if (step === 'idle') return null;

  if (step === 'fetching' || step === 'cleaning') {
    return (
      <div className="space-y-3">
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full gradient-primary transition-all duration-500"
            style={{ width: `${useDatasetStore.getState().progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {step === 'fetching' ? 'Fetching data from API…' : 'Cleaning & structuring records…'}
        </p>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive text-sm">{useDatasetStore.getState().error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search records…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 bg-background"
          />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} records</span>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Text Preview</TableHead>
              <TableHead className="w-24">Source</TableHead>
              <TableHead className="w-28">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRecords.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell className="text-muted-foreground text-xs">{page * perPage + i + 1}</TableCell>
                <TableCell className="max-w-md">
                  <p className="text-sm truncate">{r.text.split('\n')[0]}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {Object.entries(r.metadata).slice(0, 3).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · ')}
                  </p>
                </TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{r.source}</span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(r.timestamp).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
        </Button>
        <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
        <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
