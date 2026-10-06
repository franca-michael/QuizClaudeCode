import type { PublicQuestion } from "@/lib/schemas";
import { LevelBadge } from "./LevelBadge";
import { Statement } from "./Statement";

const OPTIONS = [
  { value: true, label: "Verdadeiro", hint: "V" },
  { value: false, label: "Falso", hint: "F" },
];

export function QuestionCard({
  question,
  selected,
  disabled,
  result,
  onAnswer,
}: {
  question: PublicQuestion;
  selected: boolean | null;
  disabled: boolean;
  result: { correct: boolean } | null;
  onAnswer: (answer: boolean) => void;
}) {
  return (
    <section
      aria-labelledby="statement"
      className="border-border bg-surface rounded-2xl border p-5"
    >
      <LevelBadge difficulty={question.difficulty} />
      <h2 id="statement" className="mt-3 text-xl leading-snug font-medium">
        <Statement text={question.statement} />
      </h2>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {OPTIONS.map((o) => {
          const chosen = selected === o.value;
          const tone =
            chosen && result
              ? result.correct
                ? "border-success"
                : "border-danger"
              : chosen
                ? "border-accent"
                : "border-border";
          return (
            <button
              key={o.label}
              type="button"
              disabled={disabled}
              aria-pressed={chosen}
              onClick={() => onAnswer(o.value)}
              className={`rounded-xl border-2 ${tone} enabled:hover:bg-border/40 px-4 py-4 text-lg font-semibold disabled:cursor-not-allowed ${
                disabled && !chosen ? "opacity-60" : ""
              }`}
            >
              {chosen && result && (
                <span aria-hidden="true">{result.correct ? "✓ " : "✗ "}</span>
              )}
              {o.label}{" "}
              <kbd className="text-muted text-xs font-normal">{o.hint}</kbd>
            </button>
          );
        })}
      </div>
    </section>
  );
}
