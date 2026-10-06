import { describe, expect, it } from "vitest";
import { answerPayloadSchema } from "@/lib/schemas";

const valid = {
  sessionId: "3f1c1c3e-8f0a-4b8e-9d57-1d2b7c1f0a11",
  questionId: "9b2f6c1e-1a2b-4c3d-8e4f-5a6b7c8d9e0f",
  answer: true,
  timeMs: 4200,
};

describe("answerPayloadSchema", () => {
  it("aceita payload válido", () => {
    expect(answerPayloadSchema.safeParse(valid).success).toBe(true);
  });
  it("rejeita ids que não são UUID", () => {
    expect(
      answerPayloadSchema.safeParse({ ...valid, sessionId: "x" }).success,
    ).toBe(false);
  });
  it("rejeita answer não booleano e tempo negativo", () => {
    expect(
      answerPayloadSchema.safeParse({ ...valid, answer: "true" }).success,
    ).toBe(false);
    expect(
      answerPayloadSchema.safeParse({ ...valid, timeMs: -1 }).success,
    ).toBe(false);
  });
});
