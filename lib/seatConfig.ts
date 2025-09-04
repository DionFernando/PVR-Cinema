// lib/seatConfig.ts

export const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
export const COLS = 10;

export type SeatType = "Classic" | "Prime" | "Superior";

export const CATEGORY_BY_ROW: Record<string, SeatType> = {
  A: "Classic",
  B: "Classic",
  C: "Classic",
  D: "Prime",
  E: "Prime",
  F: "Prime",
  G: "Superior",
  H: "Superior",
};

export function makeSeatId(rowLetter: string, col: number) {
  return `${rowLetter}${col}`;
}

export function parseSeatId(id: string) {
  // "A10" -> { rowLetter: "A", col: 10 }
  const rowLetter = id.charAt(0).toUpperCase();
  const col = parseInt(id.slice(1), 10);
  return { rowLetter, col };
}

export function seatTypeFromId(id: string): SeatType {
  const { rowLetter } = parseSeatId(id);
  return CATEGORY_BY_ROW[rowLetter] ?? "Classic";
}

/** Convenience builder: returns all seat ids row-major A1..A10, ..., H1..H10 */
export function allSeats(): string[] {
  const out: string[] = [];
  for (const r of ROWS) {
    for (let c = 1; c <= COLS; c++) out.push(makeSeatId(r, c));
  }
  return out;
}
