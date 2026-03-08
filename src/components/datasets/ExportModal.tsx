import { useDatasetStore } from '@/stores/dataset-store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

export function ExportModal() {
  const { records, exportData, step } = useDatasetStore();
  const [open, setOpen] = useState(false);

  if (step !== 'ready' || !records.length) return null;

  const handleExport = (format: 'json' | 'csv') => {
    exportData(format);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground">
          <Download className="w-4 h-4 mr-2" /> Export Dataset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export {records.length} Records</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => handleExport('json')}
            className="card-hover flex flex-col items-center gap-3 p-6 border-2 border-border rounded-xl hover:border-primary/50 bg-card"
          >
            <FileJson className="w-8 h-8 text-primary" />
            <div className="text-center">
              <p className="font-semibold text-foreground text-sm">JSON</p>
              <p className="text-xs text-muted-foreground mt-1">With manifest & metadata</p>
            </div>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="card-hover flex flex-col items-center gap-3 p-6 border-2 border-border rounded-xl hover:border-primary/50 bg-card"
          >
            <FileSpreadsheet className="w-8 h-8 text-accent" />
            <div className="text-center">
              <p className="font-semibold text-foreground text-sm">CSV</p>
              <p className="text-xs text-muted-foreground mt-1">Flat table format</p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
