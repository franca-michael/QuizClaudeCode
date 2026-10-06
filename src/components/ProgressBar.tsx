export function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div>
      <p className="text-muted mb-1 text-sm">
        Pergunta {current} de {total}
      </p>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label="Progresso da rodada"
        className="bg-border h-2 w-full overflow-hidden rounded-full"
      >
        <div
          className="bg-accent h-full transition-[width] duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
