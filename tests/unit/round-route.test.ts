import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

// Simula o banco devolvendo colunas extras: a rota não pode repassá-las.
const rows = (["business", "intermediate", "advanced"] as const).flatMap(
  (difficulty) =>
    Array.from({ length: 6 }, (_, i) => ({
      id: `${difficulty}-${i}`,
      statement: `Afirmação ${difficulty} ${i}`,
      difficulty,
      topic: "t",
      is_true: true,
      explanation: "SEGREDO",
    })),
);

const selectSpy = vi.fn();
vi.mock("@/lib/supabase-server", () => ({
  getSupabase: () => ({
    from: () => ({
      select: (cols: string) => {
        selectSpy(cols);
        return { eq: async () => ({ data: rows, error: null }) };
      },
    }),
  }),
}));

describe("GET /api/round", () => {
  it("não vaza o gabarito nem a explicação", async () => {
    const { GET } = await import("@/app/api/round/route");
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.questions).toHaveLength(15);
    const text = JSON.stringify(body);
    expect(text).not.toContain("is_true");
    expect(text).not.toContain("explanation");
    expect(text).not.toContain("SEGREDO");
    expect(selectSpy.mock.calls[0][0]).not.toMatch(/is_true|explanation/);
  });
});
