import { computeScore, levelFromScore, scoreByDifficulty } from "@/lib/scoring";
import type { HistoryItem } from "@/lib/quiz-reducer";
import { DIFFICULTY_ORDER } from "@/lib/round";
import { DIFFICULTY_LABEL } from "./LevelBadge";
import { Statement } from "./Statement";

export function ResultSummary({
  history,
  onRestart,
}: {
  history: HistoryItem[];
  onRestart: () => void;
}) {
  const records = history.map((h) => ({
    difficulty: h.question.difficulty,
    correct: h.correct,
  }));
  const score = computeScore(records);
  const level = levelFromScore(score);
  const byLevel = scoreByDifficulty(records);
  const wrong = history.filter((h) => !h.correct);

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-labelledby="result-title"
        className="border-border bg-surface rounded-2xl border p-6 text-center"
      >
        <h1 id="result-title" className="text-muted text-sm font-medium">
          Seu resultado
        </h1>
        <p className="mt-2 text-5xl font-bold">
          {score}
          <span className="text-muted text-2xl"> / {history.length}</span>
        </p>
        <p className="mt-2 text-lg">
          Nível estimado: <strong className="text-accent">{level}</strong>
        </p>
      </section>

      <section aria-labelledby="by-level">
        <h2 id="by-level" className="mb-2 font-semibold">
          Desempenho por nível
        </h2>
        <ul className="flex flex-col gap-2">
          {DIFFICULTY_ORDER.map((d) => (
            <li
              key={d}
              className="border-border flex justify-between rounded-xl border px-4 py-2"
            >
              <span>{DIFFICULTY_LABEL[d]}</span>
              <span className="font-medium">
                {byLevel[d].correct}/{byLevel[d].total}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="review">
        <h2 id="review" className="mb-2 font-semibold">
          Revisão dos erros
        </h2>
        {wrong.length === 0 ? (
          <p className="text-muted">Nenhum erro. Parabéns!</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {wrong.map((h) => (
              <li
                key={h.question.id}
                className="border-border rounded-xl border p-4"
              >
                <p className="font-medium">
                  <Statement text={h.question.statement} />
                </p>
                <p className="text-danger mt-1 text-sm">
                  <span aria-hidden="true">✗ </span>
                  Você respondeu {h.answer ? "Verdadeiro" : "Falso"}; o correto
                  era {h.answer ? "Falso" : "Verdadeiro"}.
                </p>
                <p className="mt-1 text-sm">{h.explanation}</p>
                {h.sourceUrl && (
                  <a
                    href={h.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm underline"
                  >
                    Documentação (nova aba)
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        onClick={onRestart}
        className="bg-accent text-accent-foreground rounded-xl px-5 py-3 font-semibold"
      >
        Jogar novamente
      </button>
    </div>
  );
}
