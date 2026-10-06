import { describe, expect, it } from "vitest";
import { buildRound } from "@/lib/round";
import type { Difficulty } from "@/lib/scoring";

const levels: Difficulty[] = ["business", "intermediate", "advanced"];
const pool = levels.flatMap((difficulty) =>
  Array.from({ length: 15 }, (_, i) => ({
    id: `${difficulty}-${i}`,
    difficulty,
  })),
);

describe("buildRound", () => {
  it("devolve 15 perguntas, 5 por nível, na ordem dos níveis", () => {
    const round = buildRound(pool);
    expect(round).toHaveLength(15);
    expect(round.map((q) => q.difficulty)).toEqual(
      levels.flatMap((l) => Array<Difficulty>(5).fill(l)),
    );
  });

  it("não repete perguntas", () => {
    const ids = buildRound(pool).map((q) => q.id);
    expect(new Set(ids).size).toBe(15);
  });

  it("falha quando o banco não tem perguntas suficientes", () => {
    expect(() =>
      buildRound(pool.filter((q) => q.difficulty !== "advanced")),
    ).toThrow();
  });
});
