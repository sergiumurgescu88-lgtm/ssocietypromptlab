import { useEffect } from "react";
import { BarChart3, Activity, Zap, Target, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useAuthStore } from "@/stores/auth-store";
import { useAnalyticsStore } from "@/stores/analytics-store";

const modelLabels: Record<string, string> = { gemini: "Gemini", "gpt-4": "GPT-4", mistral: "Mistral", deepseek: "DeepSeek" };
const pieColors = ["hsl(239 84% 67%)", "hsl(152 69% 45%)", "hsl(32 95% 55%)", "hsl(270 70% 60%)"];

const activityConfig: ChartConfig = {
  count: { label: "Actions", color: "hsl(239 84% 67%)" },
};
const revenueConfig: ChartConfig = {
  gross: { label: "Gross", color: "hsl(239 84% 67%)" },
  net: { label: "Net", color: "hsl(152 69% 45%)" },
};
const modelConfig: ChartConfig = {
  value: { label: "Calls" },
};

const Analytics = () => {
  const { session } = useAuthStore();
  const userId = session?.user?.id;
  const { summary, loading, period, setPeriod, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    if (userId) fetchAnalytics(userId);
  }, [userId, period]);

  const exportCSV = () => {
    const rows = [["Date", "Actions"], ...summary.dailyActivity.map((d) => [d.date, String(d.count)])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `analytics-${period}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: "Total Prompts", value: summary.totalPrompts, icon: BarChart3, color: "text-primary" },
    { label: "A/B Tests", value: summary.totalTests, icon: Target, color: "text-accent" },
    { label: "Tokens Used", value: summary.totalCreditsUsed.toLocaleString(), icon: Zap, color: "text-amber-500" },
    { label: "Avg Confidence", value: `${summary.avgScore}%`, icon: Activity, color: "text-emerald-500" },
  ];

  const modelPieData = Object.entries(summary.modelUsage).map(([name, value]) => ({
    name: modelLabels[name] || name,
    value,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm">Performance insights & usage metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="card-hover border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily activity chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Daily Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.dailyActivity.length > 0 ? (
              <ChartContainer config={activityConfig} className="h-[200px] w-full">
                <BarChart data={summary.dailyActivity}>
                  <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(239 84% 67%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                No activity data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model usage pie */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Model Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {modelPieData.length > 0 ? (
              <ChartContainer config={modelConfig} className="h-[200px] w-full">
                <PieChart>
                  <Pie data={modelPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={(e) => e.name}>
                    {modelPieData.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                No model usage data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.revenueData.length > 0 ? (
              <ChartContainer config={revenueConfig} className="h-[200px] w-full">
                <LineChart data={summary.revenueData}>
                  <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="gross" stroke="hsl(239 84% 67%)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="net" stroke="hsl(152 69% 45%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                No revenue data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top prompts */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Prompts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {summary.topPrompts.length > 0 ? (
              <div className="divide-y divide-border">
                {summary.topPrompts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground w-5">#{i + 1}</span>
                      <span className="text-sm font-medium text-foreground truncate">{p.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">{p.uses} uses</span>
                      <Badge variant="secondary">{p.winRate}% win</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[150px] flex items-center justify-center text-sm text-muted-foreground">
                Create prompts to see rankings
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
