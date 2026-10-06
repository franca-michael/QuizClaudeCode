import type { Difficulty } from "./scoring";
import type { PublicQuestion } from "./schemas";

export const DIFFICULTY_ORDER: readonly Difficulty[] = [
  "business",
  "intermediate",
  "advanced",
];
export const QUESTIONS_PER_LEVEL = 5;

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Sorteia 5 perguntas por nível (sem repetição), na ordem business → advanced. */
export function buildRound<T extends { id: string; difficulty: Difficulty }>(
  pool: readonly T[],
  random = Math.random,
): T[] {
  return DIFFICULTY_ORDER.flatMap((level) => {
    const candidates = pool.filter((q) => q.difficulty === level);
    if (candidates.length < QUESTIONS_PER_LEVEL) {
      throw new Error(`Banco insuficiente para o nível ${level}`);
    }
    return shuffle(candidates, random).slice(0, QUESTIONS_PER_LEVEL);
  });
}

/** Remove qualquer campo fora da lista pública (nunca vaza gabarito). */
export function toPublicQuestion(q: PublicQuestion): PublicQuestion {
  return {
    id: q.id,
    statement: q.statement,
    difficulty: q.difficulty,
    topic: q.topic,
  };
}
