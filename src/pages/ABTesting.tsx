import { useState, useEffect } from "react";
import { useABTestStore, type ABTestVariant, type ABTestRow, type TestRunRow } from "@/stores/ab-test-store";
import { streamPrompt, defaultModelConfig, modelMeta } from "@/lib/ai-stream";
import { Plus, Play, Trash2, BarChart3, Trophy, AlertCircle, FlaskConical, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  running: "bg-amber-500/10 text-amber-500",
  completed: "bg-emerald-500/10 text-emerald-500",
  cancelled: "bg-destructive/10 text-destructive",
};

// Simple metric scoring
function scoreOutput(output: string, metric: string, input: string): number {
  if (metric === "length") return Math.min(output.length / 500, 10);
  if (metric === "keyword_match") {
    const words = input.toLowerCase().split(/\s+/);
    const matches = words.filter((w) => output.toLowerCase().includes(w)).length;
    return Math.min((matches / Math.max(words.length, 1)) * 10, 10);
  }
  if (metric === "sentiment") {
    const positive = ["great", "excellent", "good", "happy", "best", "love", "wonderful"];
    const count = positive.filter((w) => output.toLowerCase().includes(w)).length;
    return Math.min(count * 2, 10);
  }
  return 5; // human_rating default
}

// Bayesian confidence
function computeConfidence(scoresA: number[], scoresB: number[]): number {
  if (scoresA.length < 2 || scoresB.length < 2) return 0;
  const meanA = scoresA.reduce((a, b) => a + b, 0) / scoresA.length;
  const meanB = scoresB.reduce((a, b) => a + b, 0) / scoresB.length;
  const varA = scoresA.reduce((a, b) => a + (b - meanA) ** 2, 0) / (scoresA.length - 1);
  const varB = scoresB.reduce((a, b) => a + (b - meanB) ** 2, 0) / (scoresB.length - 1);
  const se = Math.sqrt(varA / scoresA.length + varB / scoresB.length);
  if (se === 0) return meanA !== meanB ? 99 : 50;
  const z = Math.abs(meanA - meanB) / se;
  // Approximate p-value to confidence
  const confidence = Math.min(99, Math.round((1 - Math.exp(-0.5 * z * z)) * 100));
  return confidence;
}

const ABTesting = () => {
  const { tests, loading, fetchTests, createTest, updateTest, deleteTest, fetchRuns, insertRun } = useABTestStore();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTestRow | null>(null);
  const [runs, setRuns] = useState<TestRunRow[]>([]);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Wizard state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [variants, setVariants] = useState<ABTestVariant[]>([
    { label: "Variant A", content: "", systemPrompt: "" },
    { label: "Variant B", content: "", systemPrompt: "" },
  ]);
  const [metric, setMetric] = useState("length");
  const [targetModel, setTargetModel] = useState("gemini");
  const [sampleSize, setSampleSize] = useState(5);
  const [testInputs, setTestInputs] = useState("Hello\nTell me about AI\nWrite a poem");

  useEffect(() => { fetchTests(); }, []);

  const handleCreate = async () => {
    if (!name.trim() || variants.some((v) => !v.content.trim())) {
      toast.error("Name and all variant contents required");
      return;
    }
    const id = await createTest({ name, description, variants, metric, target_model: targetModel, sample_size: sampleSize });
    if (id) {
      toast.success("Test created!");
      setWizardOpen(false);
      resetWizard();
    }
  };

  const resetWizard = () => {
    setName(""); setDescription("");
    setVariants([{ label: "Variant A", content: "", systemPrompt: "" }, { label: "Variant B", content: "", systemPrompt: "" }]);
    setMetric("length"); setTargetModel("gemini"); setSampleSize(5);
    setTestInputs("Hello\nTell me about AI\nWrite a poem");
  };

  const addVariant = () => {
    if (variants.length >= 5) return;
    setVariants([...variants, { label: `Variant ${String.fromCharCode(65 + variants.length)}`, content: "", systemPrompt: "" }]);
  };

  const handleRunTest = async (test: ABTestRow) => {
    setRunningTestId(test.id);
    setSelectedTest(test);
    setProgress(0);
    await updateTest(test.id, { status: "running" });

    const inputs = testInputs.split("\n").filter((l) => l.trim()).slice(0, test.sample_size ?? 5);
    const totalRuns = inputs.length * test.variants.length;
    let completed = 0;
    const allScores: Record<number, number[]> = {};
    test.variants.forEach((_, i) => { allScores[i] = []; });

    for (const input of inputs) {
      for (let vi = 0; vi < test.variants.length; vi++) {
        const variant = test.variants[vi];
        let output = "";
        const start = performance.now();

        await streamPrompt({
          prompt: variant.content + "\n\nInput: " + input,
          model: test.target_model ?? "gemini",
          systemPrompt: variant.systemPrompt || undefined,
          config: defaultModelConfig,
          onDelta: (t) => { output += t; },
          onDone: async (tokens) => {
            const latency = (performance.now() - start) / 1000;
            const score = scoreOutput(output, test.metric, input);
            allScores[vi].push(score);
            await insertRun({
              test_id: test.id,
              variant_index: vi,
              input_text: input,
              output_text: output,
              score,
              tokens,
              latency: parseFloat(latency.toFixed(2)),
            });
          },
          onError: (err) => { toast.error(`Variant ${vi + 1}: ${err}`); },
        });

        completed++;
        setProgress(Math.round((completed / totalRuns) * 100));
      }
    }

    // Compute results
    const avgScores = Object.entries(allScores).map(([i, scores]) => ({
      variant: parseInt(i),
      avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      scores,
    }));
    const best = avgScores.sort((a, b) => b.avgScore - a.avgScore)[0];
    let confidence = 50;
    if (avgScores.length >= 2) {
      confidence = computeConfidence(avgScores[0].scores, avgScores[1].scores);
    }

    await updateTest(test.id, {
      status: "completed",
      results_json: { avgScores: avgScores.map((s) => ({ variant: s.variant, avgScore: parseFloat(s.avgScore.toFixed(2)) })) },
      winner_variant: best.variant,
      confidence,
    });

    const updatedRuns = await fetchRuns(test.id);
    setRuns(updatedRuns);
    setRunningTestId(null);
    toast.success("Test completed!");
  };

  const handleViewResults = async (test: ABTestRow) => {
    setSelectedTest(test);
    const r = await fetchRuns(test.id);
    setRuns(r);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">A/B Testing</h1>
          <p className="text-muted-foreground text-sm">Compare prompt variants with statistical rigor</p>
        </div>
        <Button variant="gradient" onClick={() => setWizardOpen(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> New Test
        </Button>
      </div>

      {/* Running progress */}
      {runningTestId && (
        <Card className="border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center animate-pulse-glow">
                <Play className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">Running test...</span>
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Tests list */}
      {loading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[140px] rounded-xl" />)}
        </div>
      ) : tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FlaskConical className="w-12 h-12 text-muted-foreground opacity-30 mb-4" />
          <p className="text-muted-foreground text-sm">No A/B tests yet</p>
          <Button variant="gradient" onClick={() => setWizardOpen(true)} className="mt-4 gap-1.5">
            <Plus className="w-4 h-4" /> Create First Test
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {tests.map((test) => (
            <Card key={test.id} className="card-hover border-border group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground">{test.name}</h3>
                  <Badge className={`text-[10px] capitalize ${statusColors[test.status ?? "draft"]}`}>
                    {test.status}
                  </Badge>
                </div>
                {test.description && <p className="text-xs text-muted-foreground mb-2">{test.description}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span>{test.variants.length} variants</span>
                  <span>Metric: {test.metric}</span>
                  <span>{modelMeta[test.target_model ?? "gemini"]?.label}</span>
                </div>

                {test.status === "completed" && test.winner_variant !== null && (
                  <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Trophy className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-medium">
                        {test.variants[test.winner_variant]?.label || `Variant ${test.winner_variant + 1}`} wins
                        {test.confidence ? ` with ${test.confidence}% confidence` : ""}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  {test.status === "draft" && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleRunTest(test)} disabled={!!runningTestId}>
                      <Play className="w-3 h-3" /> Run
                    </Button>
                  )}
                  {test.status === "completed" && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleViewResults(test)}>
                      <BarChart3 className="w-3 h-3" /> Results
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive opacity-0 group-hover:opacity-100" onClick={() => deleteTest(test.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results view */}
      {selectedTest?.status === "completed" && runs.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Results: {selectedTest.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Score bars */}
            <div className="space-y-3 mb-4">
              {selectedTest.variants.map((v, i) => {
                const varRuns = runs.filter((r) => r.variant_index === i);
                const avg = varRuns.length > 0
                  ? varRuns.reduce((a, r) => a + (r.score ?? 0), 0) / varRuns.length
                  : 0;
                const isWinner = selectedTest.winner_variant === i;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${isWinner ? "text-emerald-500" : "text-foreground"}`}>
                        {v.label} {isWinner && "🏆"}
                      </span>
                      <span className="text-muted-foreground">{avg.toFixed(2)} avg ({varRuns.length} runs)</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isWinner ? "gradient-primary" : "bg-muted-foreground/30"}`}
                        style={{ width: `${Math.min((avg / 10) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Confidence */}
            {selectedTest.confidence !== null && (
              <div className="p-3 rounded-lg bg-secondary text-center">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{selectedTest.variants[selectedTest.winner_variant ?? 0]?.label}</span> wins with{" "}
                  <span className="font-bold text-primary">{selectedTest.confidence}%</span> statistical confidence
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create wizard dialog */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Create A/B Test</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Test Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Email Subject Test" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional..." />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Metric</Label>
                <Select value={metric} onValueChange={setMetric}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="length">Response Length</SelectItem>
                    <SelectItem value="sentiment">Sentiment</SelectItem>
                    <SelectItem value="keyword_match">Keyword Match</SelectItem>
                    <SelectItem value="human_rating">Human Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={targetModel} onValueChange={setTargetModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="mistral">Mistral</SelectItem>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sample Size ({sampleSize})</Label>
                <Slider value={[sampleSize]} onValueChange={([v]) => setSampleSize(v)} min={2} max={30} step={1} />
              </div>
            </div>

            {/* Variants */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Variants ({variants.length})</Label>
                {variants.length < 5 && (
                  <Button variant="outline" size="sm" className="text-xs gap-1" onClick={addVariant}>
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                )}
              </div>
              {variants.map((v, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Input
                        value={v.label}
                        onChange={(e) => {
                          const next = [...variants];
                          next[i] = { ...v, label: e.target.value };
                          setVariants(next);
                        }}
                        className="text-xs font-semibold h-7 w-40"
                      />
                      {variants.length > 2 && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setVariants(variants.filter((_, j) => j !== i))}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      value={v.content}
                      onChange={(e) => {
                        const next = [...variants];
                        next[i] = { ...v, content: e.target.value };
                        setVariants(next);
                      }}
                      rows={3}
                      className="font-mono text-xs"
                      placeholder="Prompt content..."
                    />
                    <Input
                      value={v.systemPrompt}
                      onChange={(e) => {
                        const next = [...variants];
                        next[i] = { ...v, systemPrompt: e.target.value };
                        setVariants(next);
                      }}
                      className="text-xs"
                      placeholder="System prompt (optional)"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Test Inputs */}
            <div className="space-y-2">
              <Label>Test Inputs (one per line)</Label>
              <Textarea
                value={testInputs}
                onChange={(e) => setTestInputs(e.target.value)}
                rows={3}
                className="text-xs"
                placeholder="Enter test inputs, one per line..."
              />
            </div>

            <Button variant="gradient" onClick={handleCreate} className="w-full">
              <FlaskConical className="w-4 h-4 mr-2" /> Create Test
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ABTesting;
