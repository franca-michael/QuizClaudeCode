import type { HistoryItem } from "@/lib/quiz-reducer";

export function FeedbackPanel({
  item,
  isLast,
  onNext,
}: {
  item: HistoryItem;
  isLast: boolean;
  onNext: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl border-2 p-4 ${item.correct ? "border-success" : "border-danger"}`}
    >
      <p
        className={`text-lg font-semibold ${item.correct ? "text-success" : "text-danger"}`}
      >
        <span aria-hidden="true">{item.correct ? "✓" : "✗"}</span>{" "}
        {item.correct ? "Você acertou!" : "Você errou."}
      </p>
      <p className="mt-2">{item.explanation}</p>
      {item.sourceUrl && (
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm underline"
        >
          Ver na documentação (abre em nova aba)
        </a>
      )}
      <div className="mt-4">
        <button
          type="button"
          autoFocus
          onClick={onNext}
          className="bg-accent text-accent-foreground w-full rounded-xl px-5 py-3 font-semibold sm:w-auto"
        >
          {isLast ? "Ver resultado" : "Próxima"}{" "}
          <kbd className="ml-1 text-xs opacity-70">Enter</kbd>
        </button>
      </div>
    </div>
  );
}
