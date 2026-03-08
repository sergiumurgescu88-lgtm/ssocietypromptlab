import { Store } from "lucide-react";

const Marketplace = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
      <p className="text-muted-foreground text-sm">Browse and purchase prompts from the community</p>
    </div>
    <div className="flex items-center justify-center h-64 border border-dashed border-border rounded-xl">
      <div className="text-center text-muted-foreground">
        <Store className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Marketplace coming soon</p>
      </div>
    </div>
  </div>
);

export default Marketplace;
