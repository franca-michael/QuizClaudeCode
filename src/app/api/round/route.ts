import { buildRound, toPublicQuestion } from "@/lib/round";
import { publicQuestionSchema } from "@/lib/schemas";
import { getSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Seleciona só colunas públicas: o gabarito nem sai do banco.
    const { data, error } = await getSupabase()
      .from("questions")
      .select("id, statement, difficulty, topic")
      .eq("active", true);
    if (error) throw error;
    const pool = publicQuestionSchema.array().parse(data);
    const questions = buildRound(pool).map(toPublicQuestion);
    return Response.json(
      { questions },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("round failed", err);
    return Response.json(
      { error: "Não foi possível montar a rodada." },
      { status: 500 },
    );
  }
}
