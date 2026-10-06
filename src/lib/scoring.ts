export type Difficulty = "business" | "intermediate" | "advanced";
export type Level = "Iniciante" | "Intermediário" | "Avançado" | "Expert";

export interface AnswerRecord {
  difficulty: Difficulty;
  correct: boolean;
}

// Limite inferior (inclusivo) de acertos para cada nível, em ordem crescente.
export const LEVEL_THRESHOLDS: ReadonlyArray<{ min: number; level: Level }> = [
  { min: 0, level: "Iniciante" },
  { min: 6, level: "Intermediário" },
  { min: 10, level: "Avançado" },
  { min: 14, level: "Expert" },
];

export function levelFromScore(
  score: number,
  thresholds = LEVEL_THRESHOLDS,
): Level {
  let result = thresholds[0].level;
  for (const { min, level } of thresholds) {
    if (score >= min) result = level;
  }
  return result;
}

export function scoreByDifficulty(
  answers: AnswerRecord[],
): Record<Difficulty, { correct: number; total: number }> {
  const result = {
    business: { correct: 0, total: 0 },
    intermediate: { correct: 0, total: 0 },
    advanced: { correct: 0, total: 0 },
  };
  for (const { difficulty, correct } of answers) {
    result[difficulty].total += 1;
    if (correct) result[difficulty].correct += 1;
  }
  return result;
}

export function computeScore(answers: AnswerRecord[]): number {
  return answers.filter((a) => a.correct).length;
}
