import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const insert = vi.fn();
let found: {
  is_true: boolean;
  explanation: string;
  source_url: string | null;
} | null = {
  is_true: true,
  explanation: "porque sim",
  source_url: null,
};

vi.mock("@/lib/supabase-server", () => ({
  getSupabase: () => ({
    from: (table: string) =>
      table === "questions"
        ? {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: found, error: null }),
              }),
            }),
          }
        : {
            insert: async (row: unknown) => (
              insert(row),
              { error: { message: "falhou" } }
            ),
          },
  }),
}));

const post = (body: unknown) =>
  new Request("http://x/api/answer", {
    method: "POST",
    body: JSON.stringify(body),
  });
const base = {
  sessionId: "3f1c1c3e-8f0a-4b8e-9d57-1d2b7c1f0a11",
  questionId: "9b2f6c1e-1a2b-4c3d-8e4f-5a6b7c8d9e0f",
  answer: false,
};

describe("POST /api/answer", () => {
  it("400 para payload inválido", async () => {
    const { POST } = await import("@/app/api/answer/route");
    expect((await POST(post({ foo: 1 }))).status).toBe(400);
  });

  it("corrige no servidor e não quebra se o insert falhar", async () => {
    const { POST } = await import("@/app/api/answer/route");
    const res = await POST(post(base));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      correct: false,
      explanation: "porque sim",
      sourceUrl: null,
    });
    expect(insert).toHaveBeenCalled();
  });

  it("404 quando a pergunta não existe", async () => {
    found = null;
    const { POST } = await import("@/app/api/answer/route");
    const res = await POST(
      post({ ...base, sessionId: "11111111-1111-4111-8111-111111111111" }),
    );
    expect(res.status).toBe(404);
  });
});
