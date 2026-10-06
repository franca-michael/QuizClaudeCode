import { z } from "zod";

export const difficultySchema = z.enum([
  "business",
  "intermediate",
  "advanced",
]);

export const answerPayloadSchema = z.object({
  sessionId: z.uuid(),
  questionId: z.uuid(),
  answer: z.boolean(),
  timeMs: z.number().int().min(0).max(3_600_000).optional(),
});
export type AnswerPayload = z.infer<typeof answerPayloadSchema>;

export const publicQuestionSchema = z.object({
  id: z.string(),
  statement: z.string(),
  difficulty: difficultySchema,
  topic: z.string(),
});
export type PublicQuestion = z.infer<typeof publicQuestionSchema>;

export const roundResponseSchema = z.object({
  questions: z.array(publicQuestionSchema),
});

export const answerResponseSchema = z.object({
  correct: z.boolean(),
  explanation: z.string(),
  sourceUrl: z.string().nullable(),
});
export type AnswerResponse = z.infer<typeof answerResponseSchema>;
