import { FlaskConical } from "lucide-react";

const ABTesting = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-foreground">A/B Testing</h1>
      <p className="text-muted-foreground text-sm">Compare prompt variations and analyze results</p>
    </div>
    <div className="flex items-center justify-center h-64 border border-dashed border-border rounded-xl">
      <div className="text-center text-muted-foreground">
        <FlaskConical className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">A/B Testing coming soon</p>
      </div>
    </div>
  </div>
);

export default ABTesting;
