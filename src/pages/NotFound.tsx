import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Search, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-8xl font-extrabold gradient-primary bg-clip-text text-transparent leading-none">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Page not found</h1>
          <p className="text-sm text-muted-foreground">
            The page <code className="px-1.5 py-0.5 rounded bg-muted text-xs">{location.pathname}</code> doesn't exist.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Go Back
          </Button>
          <Button variant="gradient" size="sm" asChild>
            <Link to="/dashboard"><Home className="w-4 h-4 mr-1" /> Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
