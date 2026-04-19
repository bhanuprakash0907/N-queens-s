import { useEffect, useMemo, useRef, useState } from "react";
import { Crown, Play, Pause, SkipForward, SkipBack, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChessBoard } from "@/components/ChessBoard";
import { solveNQueens, type Step } from "@/lib/nqueens";
import { cn } from "@/lib/utils";

export function NQueensVisualizer() {
  const [n, setN] = useState(6);
  const [pendingN, setPendingN] = useState("6");
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(300); // ms per step (lower = faster)
  const intervalRef = useRef<number | null>(null);

  const { steps, solutions } = useMemo(() => solveNQueens(n), [n]);
  const currentStep: Step | null = steps[stepIdx] ?? null;

  useEffect(() => {
    if (!playing) return;
    intervalRef.current = window.setInterval(() => {
      setStepIdx((i) => {
        if (i >= steps.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, speed);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [playing, speed, steps.length]);

  const handleApplyN = () => {
    const v = parseInt(pendingN, 10);
    if (isNaN(v) || v < 1 || v > 10) return;
    setN(v);
    setStepIdx(0);
    setPlaying(false);
  };

  const reset = () => {
    setStepIdx(0);
    setPlaying(false);
  };

  const placedCount = currentStep?.board.filter((c) => c !== -1).length ?? 0;
  const foundSolutions =
    steps.slice(0, stepIdx + 1).filter((s) => s.type === "solution").length;

  const stepTypeColor: Record<string, string> = {
    try: "bg-accent text-accent-foreground",
    place: "bg-success text-success-foreground",
    conflict: "bg-destructive text-destructive-foreground",
    backtrack: "bg-muted text-muted-foreground",
    solution: "bg-primary text-primary-foreground",
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* Header */}
        <header className="mb-8 text-center animate-fade-in">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Algorithm Design & Analysis
          </div>
          <h1 className="flex items-center justify-center gap-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            <Crown
              className="h-9 w-9 text-primary"
              fill="currentColor"
              strokeWidth={1.5}
            />
            N-Queens Visualizer
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Watch the backtracking algorithm place queens one row at a time —
            trying, conflicting, placing, and backtracking until every solution is found.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
          {/* Board */}
          <div className="flex flex-col items-center gap-4">
            <ChessBoard n={n} step={currentStep} size={Math.min(520, 60 * n + 60)} />

            {/* Controls */}
            <Card className="w-full max-w-[560px] p-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                  disabled={stepIdx === 0}
                  aria-label="Previous step"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => setPlaying((p) => !p)}
                  disabled={stepIdx >= steps.length - 1}
                  className="gap-2"
                >
                  {playing ? (
                    <>
                      <Pause className="h-4 w-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" /> Play
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setStepIdx((i) => Math.min(steps.length - 1, i + 1))
                  }
                  disabled={stepIdx >= steps.length - 1}
                  aria-label="Next step"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={reset} aria-label="Reset">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Step {stepIdx + 1} / {steps.length}</span>
                  <span>Speed: {(1000 / speed).toFixed(1)}x</span>
                </div>
                <Slider
                  value={[stepIdx]}
                  onValueChange={(v) => {
                    setStepIdx(v[0]);
                    setPlaying(false);
                  }}
                  max={Math.max(0, steps.length - 1)}
                  step={1}
                />
                <div className="flex items-center gap-3 pt-1">
                  <Label className="text-xs text-muted-foreground">Speed</Label>
                  <Slider
                    value={[1100 - speed]}
                    onValueChange={(v) => setSpeed(1100 - v[0])}
                    min={50}
                    max={1050}
                    step={50}
                    className="flex-1"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Side panel */}
          <div className="flex flex-col gap-4">
            {/* N input */}
            <Card className="p-4">
              <Label htmlFor="n-input" className="text-sm font-semibold">
                Board Size (N)
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Choose between 1 and 10. Larger N generates more steps.
              </p>
              <div className="mt-3 flex gap-2">
                <Input
                  id="n-input"
                  type="number"
                  min={1}
                  max={10}
                  value={pendingN}
                  onChange={(e) => setPendingN(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyN()}
                  className="w-24"
                />
                <Button onClick={handleApplyN} className="flex-1">
                  Solve {pendingN}-Queens
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[4, 5, 6, 7, 8].map((v) => (
                  <Button
                    key={v}
                    variant={n === v ? "default" : "secondary"}
                    size="sm"
                    onClick={() => {
                      setPendingN(String(v));
                      setN(v);
                      setStepIdx(0);
                      setPlaying(false);
                    }}
                  >
                    N={v}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Status */}
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <Stat label="Queens placed" value={`${placedCount} / ${n}`} />
                <Stat label="Solutions found" value={`${foundSolutions} / ${solutions.length}`} />
                <Stat label="Total steps" value={`${steps.length}`} />
              </div>
            </Card>

            {/* Current step */}
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Current Step
                  </p>
                  <p className="mt-1 text-base font-medium text-foreground">
                    {currentStep?.message ?? "Press play to begin."}
                  </p>
                </div>
                {currentStep && (
                  <Badge
                    className={cn(
                      "uppercase",
                      stepTypeColor[currentStep.type],
                    )}
                  >
                    {currentStep.type}
                  </Badge>
                )}
              </div>
            </Card>

            {/* Legend */}
            <Card className="p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Legend
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <LegendItem color="var(--board-trying)" label="Trying position" />
                <LegendItem color="var(--board-attack)" label="Conflict / attack" />
                <LegendItem color="var(--board-safe)" label="Safe placement" />
                <LegendItem color="var(--primary)" label="Queen placed" />
              </div>
            </Card>

            {/* Solutions */}
            {solutions.length > 0 && (
              <Card className="p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  All Solutions ({solutions.length})
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {solutions.map((sol, i) => (
                    <MiniBoard key={i} board={sol} n={n} index={i + 1} />
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Backtracking algorithm visualizer · Built for ADA lab demonstrations
        </footer>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-4 w-4 rounded border border-border"
        style={{ backgroundColor: color }}
      />
      <span className="text-foreground/80">{label}</span>
    </div>
  );
}

function MiniBoard({
  board,
  n,
  index,
}: {
  board: number[];
  n: number;
  index: number;
}) {
  const cell = Math.max(8, Math.floor(110 / n));
  return (
    <div className="rounded-md bg-secondary p-2">
      <p className="mb-1 text-center text-[10px] font-semibold text-muted-foreground">
        #{index}
      </p>
      <div
        className="mx-auto grid overflow-hidden rounded"
        style={{
          gridTemplateColumns: `repeat(${n}, ${cell}px)`,
          width: cell * n,
        }}
      >
        {Array.from({ length: n * n }).map((_, idx) => {
          const r = Math.floor(idx / n);
          const c = idx % n;
          const isLight = (r + c) % 2 === 0;
          const hasQueen = board[r] === c;
          return (
            <div
              key={idx}
              className="flex items-center justify-center"
              style={{
                width: cell,
                height: cell,
                backgroundColor: isLight
                  ? "var(--board-light)"
                  : "var(--board-dark)",
              }}
            >
              {hasQueen && (
                <Crown
                  className="text-primary"
                  style={{ width: cell * 0.7, height: cell * 0.7 }}
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
