import { mockStats, mockPrompts, modelLabels } from "@/lib/mock-data";
import { FileText, FlaskConical, TrendingUp, Coins, Clock, Star, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ElementType> = {
  FileText, FlaskConical, TrendingUp, Coins,
};

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, Alex 👋</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat) => {
          const Icon = iconMap[stat.icon] || FileText;
          const isPositive = (stat.change ?? 0) >= 0;
          return (
            <Card key={stat.label} className="card-hover border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg gradient-subtle flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  {stat.change !== undefined && (
                    <span className={`text-xs font-medium flex items-center gap-0.5 ${isPositive ? "text-emerald-500" : "text-destructive"}`}>
                      <ArrowUpRight className={`w-3 h-3 ${!isPositive ? "rotate-90" : ""}`} />
                      {isPositive ? "+" : ""}{stat.change}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Prompts */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Prompts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {mockPrompts.map((prompt) => (
              <div key={prompt.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0">
                    {prompt.isFavorite ? (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{prompt.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{prompt.content.slice(0, 60)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <Badge variant="secondary" className="text-xs">
                    {modelLabels[prompt.model]}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>v{prompt.versions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
