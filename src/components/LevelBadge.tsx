import type { Difficulty } from "@/lib/scoring";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  business: "Negócio",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

export function LevelBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className="border-border text-muted inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium">
      {DIFFICULTY_LABEL[difficulty]}
    </span>
  );
}
