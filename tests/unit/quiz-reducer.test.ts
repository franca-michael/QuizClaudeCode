import { describe, expect, it } from "vitest";
import { quizReducer, initialState, type QuizState } from "@/lib/quiz-reducer";
import type { PublicQuestion } from "@/lib/schemas";

const questions: PublicQuestion[] = [
  { id: "a", statement: "A", difficulty: "business", topic: "t" },
  { id: "b", statement: "B", difficulty: "advanced", topic: "t" },
];
const response = { correct: true, explanation: "ok", sourceUrl: null };

describe("quizReducer", () => {
  it("percorre a rodada até finalizar", () => {
    let s: QuizState = quizReducer(initialState, { type: "loaded", questions });
    for (let i = 0; i < 2; i++) {
      s = quizReducer(s, { type: "submit", answer: true });
      s = quizReducer(s, { type: "answered", response, timeMs: 10 });
      s = quizReducer(s, { type: "next" });
    }
    expect(s.status).toBe("finished");
    if (s.status === "finished") expect(s.history).toHaveLength(2);
  });

  it("não permite trocar a resposta depois de enviada", () => {
    let s = quizReducer(initialState, { type: "loaded", questions });
    s = quizReducer(s, { type: "submit", answer: true });
    const again = quizReducer(s, { type: "submit", answer: false });
    expect(again).toBe(s);
  });

  it("volta a permitir resposta se o envio falhar", () => {
    let s = quizReducer(initialState, { type: "loaded", questions });
    s = quizReducer(s, { type: "submit", answer: true });
    s = quizReducer(s, { type: "submitFailed", message: "erro" });
    expect(s).toMatchObject({
      phase: "asking",
      pendingAnswer: null,
      notice: "erro",
    });
  });
});
