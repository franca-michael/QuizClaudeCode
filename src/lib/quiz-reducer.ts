import type { AnswerResponse, PublicQuestion } from "./schemas";

export interface HistoryItem {
  question: PublicQuestion;
  answer: boolean;
  correct: boolean;
  explanation: string;
  sourceUrl: string | null;
  timeMs: number;
}

export type QuizState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "playing";
      questions: PublicQuestion[];
      index: number;
      phase: "asking" | "submitting" | "feedback";
      history: HistoryItem[];
      pendingAnswer: boolean | null;
      notice: string | null;
    }
  | { status: "finished"; history: HistoryItem[] };

export type QuizAction =
  | { type: "reset" }
  | { type: "loaded"; questions: PublicQuestion[] }
  | { type: "failed"; message: string }
  | { type: "submit"; answer: boolean }
  | { type: "answered"; response: AnswerResponse; timeMs: number }
  | { type: "submitFailed"; message: string }
  | { type: "next" };

export const initialState: QuizState = { status: "loading" };

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "reset":
      return initialState;
    case "loaded":
      return {
        status: "playing",
        questions: action.questions,
        index: 0,
        phase: "asking",
        history: [],
        pendingAnswer: null,
        notice: null,
      };
    case "failed":
      return { status: "error", message: action.message };
    case "submit":
      // Não permite trocar/reenviar a resposta.
      if (state.status !== "playing" || state.phase !== "asking") return state;
      return {
        ...state,
        phase: "submitting",
        pendingAnswer: action.answer,
        notice: null,
      };
    case "answered": {
      if (
        state.status !== "playing" ||
        state.phase !== "submitting" ||
        state.pendingAnswer === null
      )
        return state;
      const item: HistoryItem = {
        question: state.questions[state.index],
        answer: state.pendingAnswer,
        correct: action.response.correct,
        explanation: action.response.explanation,
        sourceUrl: action.response.sourceUrl,
        timeMs: action.timeMs,
      };
      return { ...state, phase: "feedback", history: [...state.history, item] };
    }
    case "submitFailed":
      if (state.status !== "playing" || state.phase !== "submitting")
        return state;
      return {
        ...state,
        phase: "asking",
        pendingAnswer: null,
        notice: action.message,
      };
    case "next": {
      if (state.status !== "playing" || state.phase !== "feedback")
        return state;
      if (state.index + 1 >= state.questions.length)
        return { status: "finished", history: state.history };
      return {
        ...state,
        index: state.index + 1,
        phase: "asking",
        pendingAnswer: null,
        notice: null,
      };
    }
  }
}
