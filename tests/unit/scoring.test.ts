import { describe, expect, test } from "vitest";
import {
  computeScore,
  levelFromScore,
  scoreByDifficulty,
  type AnswerRecord,
} from "@/lib/scoring";

describe("levelFromScore", () => {
  test.each([
    [0, "Iniciante"],
    [5, "Iniciante"],
    [6, "Intermediário"],
    [9, "Intermediário"],
    [10, "Avançado"],
    [13, "Avançado"],
    [14, "Expert"],
    [15, "Expert"],
  ])("nota %i -> %s", (score, level) => {
    expect(levelFromScore(score)).toBe(level);
  });

  test("aceita limites customizados", () => {
    const custom = [
      { min: 0, level: "Iniciante" as const },
      { min: 3, level: "Expert" as const },
    ];
    expect(levelFromScore(2, custom)).toBe("Iniciante");
    expect(levelFromScore(3, custom)).toBe("Expert");
  });
});

describe("computeScore e scoreByDifficulty", () => {
  const answers: AnswerRecord[] = [
    { difficulty: "business", correct: true },
    { difficulty: "business", correct: false },
    { difficulty: "intermediate", correct: true },
    { difficulty: "advanced", correct: true },
    { difficulty: "advanced", correct: true },
  ];

  test("conta acertos", () => {
    expect(computeScore(answers)).toBe(4);
    expect(computeScore([])).toBe(0);
  });

  test("agrupa por nível", () => {
    expect(scoreByDifficulty(answers)).toEqual({
      business: { correct: 1, total: 2 },
      intermediate: { correct: 1, total: 1 },
      advanced: { correct: 2, total: 2 },
    });
  });
});
