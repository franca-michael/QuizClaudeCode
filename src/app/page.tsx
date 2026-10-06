import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-6">
      <header className="flex justify-end">
        <ThemeToggle />
      </header>
      <div className="flex flex-1 flex-col justify-center gap-6">
        <h1 className="text-4xl font-semibold">Quiz Claude Code</h1>
        <p className="text-lg">
          Verdadeiro ou Falso: teste o que você sabe sobre o Claude Code. São 15
          perguntas, 5 de negócio, 5 intermediárias e 5 avançadas, com
          explicação após cada resposta.
        </p>
        <p className="text-muted text-sm">
          Atalhos: <kbd>V</kbd>/<kbd>←</kbd> Verdadeiro · <kbd>F</kbd>/
          <kbd>→</kbd> Falso · <kbd>Enter</kbd> Próxima.
        </p>
        <Link
          href="/quiz"
          className="bg-accent text-accent-foreground w-full rounded-xl px-6 py-4 text-center text-lg font-semibold sm:w-auto sm:self-start"
        >
          Começar
        </Link>
      </div>
    </main>
  );
}
