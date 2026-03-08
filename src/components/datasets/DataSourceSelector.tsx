import { Newspaper, Film, ChefHat } from 'lucide-react';
import { dataSources } from '@/lib/data-sources';
import { useDatasetStore } from '@/stores/dataset-store';
import { cn } from '@/lib/utils';

const ICONS: Record<string, React.ElementType> = { Newspaper, Film, ChefHat };

export function DataSourceSelector() {
  const { selectedSource, selectSource } = useDatasetStore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {dataSources.map(ds => {
        const Icon = ICONS[ds.config.icon] || Newspaper;
        const active = selectedSource === ds.config.id;
        return (
          <button
            key={ds.config.id}
            onClick={() => selectSource(ds.config.id)}
            className={cn(
              'card-hover text-left p-5 border-2 transition-all bg-card',
              active ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${ds.config.color}20`, color: ds.config.color }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">{ds.config.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ds.config.description}</p>
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {ds.config.freeTierLimit}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
