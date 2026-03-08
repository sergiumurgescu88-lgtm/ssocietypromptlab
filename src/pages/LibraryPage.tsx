import { Library as LibraryIcon } from "lucide-react";

const LibraryPage = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Prompt Library</h1>
      <p className="text-muted-foreground text-sm">Your saved prompts with version history</p>
    </div>
    <div className="flex items-center justify-center h-64 border border-dashed border-border rounded-xl">
      <div className="text-center text-muted-foreground">
        <LibraryIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Library coming soon</p>
      </div>
    </div>
  </div>
);

export default LibraryPage;
