import type { Metadata } from "next";
import Link from "next/link";
import { QuizGame } from "@/components/QuizGame";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = { title: "Rodada · Quiz Claude Code" };

export default function QuizPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-semibold">
          Quiz Claude Code
        </Link>
        <ThemeToggle />
      </header>
      <QuizGame />
    </main>
  );
}
