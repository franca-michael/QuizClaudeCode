import { rateLimit } from "@/lib/rate-limit";
import { answerPayloadSchema } from "@/lib/schemas";
import { getSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = answerPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Payload inválido." }, { status: 400 });
  }
  const { sessionId, questionId, answer, timeMs } = parsed.data;

  // Chave por sessão anônima: nenhum IP é armazenado.
  if (!rateLimit(sessionId)) {
    return Response.json({ error: "Muitas requisições." }, { status: 429 });
  }

  try {
    const supabase = getSupabase();
    const { data: q, error } = await supabase
      .from("questions")
      .select("is_true, explanation, source_url")
      .eq("id", questionId)
      .maybeSingle();
    if (error) throw error;
    if (!q)
      return Response.json(
        { error: "Pergunta não encontrada." },
        { status: 404 },
      );

    const correct = q.is_true === answer;

    // Analytics nunca bloqueia o quiz.
    const { error: insertError } = await supabase.from("answer_events").insert({
      session_id: sessionId,
      question_id: questionId,
      answer,
      correct,
      time_ms: timeMs ?? null,
    });
    if (insertError) console.error("answer_events insert failed", insertError);

    return Response.json({
      correct,
      explanation: q.explanation,
      sourceUrl: q.source_url ?? null,
    });
  } catch (err) {
    console.error("answer failed", err);
    return Response.json(
      { error: "Erro ao validar resposta." },
      { status: 500 },
    );
  }
}
