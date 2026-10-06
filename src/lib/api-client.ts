import {
  answerResponseSchema,
  roundResponseSchema,
  type AnswerResponse,
  type PublicQuestion,
} from "./schemas";

export async function fetchRound(): Promise<PublicQuestion[]> {
  const res = await fetch("/api/round", { cache: "no-store" });
  if (!res.ok) throw new Error("Não foi possível carregar a rodada.");
  return roundResponseSchema.parse(await res.json()).questions;
}

export async function sendAnswer(payload: {
  sessionId: string;
  questionId: string;
  answer: boolean;
  timeMs: number;
}): Promise<AnswerResponse> {
  const res = await fetch("/api/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 429)
    throw new Error("Muitas respostas em pouco tempo. Aguarde um instante.");
  if (!res.ok)
    throw new Error("Não foi possível validar a resposta. Tente de novo.");
  return answerResponseSchema.parse(await res.json());
}
