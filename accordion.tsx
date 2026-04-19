import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Step } from "@/lib/nqueens";

interface ChessBoardProps {
  n: number;
  step: Step | null;
  size?: number;
}

export function ChessBoard({ n, step, size = 480 }: ChessBoardProps) {
  const board = step?.board ?? Array(n).fill(-1);
  const cellSize = Math.floor(size / n);
  const attackSet = new Set(
    (step?.attackingCells ?? []).map(([r, c]) => `${r}-${c}`),
  );

  return (
    <div
      className="rounded-2xl p-3 shadow-[var(--shadow-elegant)]"
      style={{
        background: "var(--gradient-primary)",
      }}
    >
      <div
        className="grid overflow-hidden rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${n}, ${cellSize}px)`,
          width: cellSize * n,
          height: cellSize * n,
        }}
      >
        {Array.from({ length: n * n }).map((_, idx) => {
          const row = Math.floor(idx / n);
          const col = idx % n;
          const isLight = (row + col) % 2 === 0;
          const hasQueen = board[row] === col;
          const isCurrent =
            step && step.row === row && step.col === col;
          const isAttacker = attackSet.has(`${row}-${col}`);

          let highlight = "";
          if (step?.type === "try" && isCurrent) {
            highlight = "ring-4 ring-inset";
            highlight += " [box-shadow:inset_0_0_0_4px_var(--accent)]";
          }
          if (step?.type === "conflict" && isCurrent) {
            highlight = "[background-color:var(--board-attack)]";
          }
          if (isAttacker) {
            highlight = "[background-color:var(--board-attack)]";
          }
          if (step?.type === "place" && isCurrent) {
            highlight = "[background-color:var(--board-safe)]";
          }
          if (step?.type === "solution" && hasQueen) {
            highlight = "[background-color:var(--board-safe)]";
          }

          return (
            <div
              key={idx}
              className={cn(
                "flex items-center justify-center transition-all duration-200",
                highlight,
              )}
              style={{
                backgroundColor: highlight
                  ? undefined
                  : isLight
                    ? "var(--board-light)"
                    : "var(--board-dark)",
                width: cellSize,
                height: cellSize,
              }}
            >
              {hasQueen && (
                <Crown
                  className={cn(
                    "animate-scale-in drop-shadow-lg",
                    step?.type === "solution"
                      ? "text-success"
                      : "text-primary-foreground",
                  )}
                  style={{
                    width: cellSize * 0.62,
                    height: cellSize * 0.62,
                    filter:
                      "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
                  }}
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              )}
              {step?.type === "try" && isCurrent && !hasQueen && (
                <Crown
                  className="animate-pulse text-accent-foreground/70"
                  style={{
                    width: cellSize * 0.55,
                    height: cellSize * 0.55,
                  }}
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
