export type StepType =
  | "try"
  | "conflict"
  | "place"
  | "backtrack"
  | "solution";

export interface Step {
  type: StepType;
  row: number;
  col: number;
  board: number[]; // board[row] = col, or -1
  attackingCells?: Array<[number, number]>;
  message: string;
  solutionIndex?: number;
}

function getAttackers(
  board: number[],
  row: number,
  col: number,
): Array<[number, number]> {
  const attackers: Array<[number, number]> = [];
  for (let r = 0; r < row; r++) {
    const c = board[r];
    if (c === -1) continue;
    if (c === col || Math.abs(c - col) === Math.abs(r - row)) {
      attackers.push([r, c]);
    }
  }
  return attackers;
}

export function solveNQueens(n: number): {
  steps: Step[];
  solutions: number[][];
} {
  const steps: Step[] = [];
  const solutions: number[][] = [];
  const board: number[] = Array(n).fill(-1);

  function recurse(row: number) {
    if (row === n) {
      const solution = [...board];
      solutions.push(solution);
      steps.push({
        type: "solution",
        row: row - 1,
        col: board[row - 1],
        board: [...board],
        message: `🎉 Solution #${solutions.length} found!`,
        solutionIndex: solutions.length,
      });
      return;
    }
    for (let col = 0; col < n; col++) {
      steps.push({
        type: "try",
        row,
        col,
        board: [...board],
        message: `Trying queen at row ${row + 1}, col ${col + 1}`,
      });
      const attackers = getAttackers(board, row, col);
      if (attackers.length === 0) {
        board[row] = col;
        steps.push({
          type: "place",
          row,
          col,
          board: [...board],
          message: `✓ Safe — placed queen at (${row + 1}, ${col + 1})`,
        });
        recurse(row + 1);
        board[row] = -1;
      } else {
        steps.push({
          type: "conflict",
          row,
          col,
          board: [...board],
          attackingCells: attackers,
          message: `✗ Conflict at (${row + 1}, ${col + 1}) — attacked by ${attackers.length} queen(s)`,
        });
      }
    }
    if (row > 0) {
      steps.push({
        type: "backtrack",
        row: row - 1,
        col: board[row - 1] ?? -1,
        board: [...board],
        message: `↩ Backtracking from row ${row + 1}`,
      });
    }
  }

  recurse(0);
  return { steps, solutions };
}
