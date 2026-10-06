"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { fetchRound, sendAnswer } from "@/lib/api-client";
import { initialState, quizReducer } from "@/lib/quiz-reducer";
import { FeedbackPanel } from "./FeedbackPanel";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { ResultSummary } from "./ResultSummary";

export function QuizGame() {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const sessionId = useRef("");
  const startedAt = useRef(0);

  const load = useCallback(() => {
    dispatch({ type: "reset" });
    sessionId.current = crypto.randomUUID();
    fetchRound()
      .then((questions) => {
        startedAt.current = Date.now();
        dispatch({ type: "loaded", questions });
      })
      .catch((e: Error) => dispatch({ type: "failed", message: e.message }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const answer = useCallback(
    (value: boolean) => {
      if (state.status !== "playing" || state.phase !== "asking") return;
      const question = state.questions[state.index];
      const timeMs = Date.now() - startedAt.current;
      dispatch({ type: "submit", answer: value });
      sendAnswer({
        sessionId: sessionId.current,
        questionId: question.id,
        answer: value,
        timeMs,
      })
        .then((response) => dispatch({ type: "answered", response, timeMs }))
        .catch((e: Error) =>
          dispatch({ type: "submitFailed", message: e.message }),
        );
    },
    [state],
  );

  const next = useCallback(() => {
    startedAt.current = Date.now();
    dispatch({ type: "next" });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      if (state.status !== "playing") return;
      const key = e.key.toLowerCase();
      if (state.phase === "asking") {
        if (key === "v" || key === "arrowleft") answer(true);
        else if (key === "f" || key === "arrowright") answer(false);
      } else if (state.phase === "feedback" && key === "enter") {
        // preventDefault evita disparo duplo com o clique nativo do botão focado.
        e.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, answer, next]);

  if (state.status === "loading") {
    return (
      <p role="status" className="text-muted">
        Sorteando perguntas…
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-danger">{state.message}</p>
        <button
          type="button"
          onClick={load}
          className="bg-accent text-accent-foreground rounded-xl px-5 py-3 font-semibold"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (state.status === "finished") {
    return <ResultSummary history={state.history} onRestart={load} />;
  }

  const question = state.questions[state.index];
  const current =
    state.phase === "feedback" ? state.history[state.history.length - 1] : null;

  return (
    <div className="flex flex-col gap-5">
      <ProgressBar current={state.index + 1} total={state.questions.length} />
      <QuestionCard
        key={question.id}
        question={question}
        selected={state.pendingAnswer}
        disabled={state.phase !== "asking"}
        result={current}
        onAnswer={answer}
      />
      {state.notice && (
        <p role="alert" className="text-danger">
          {state.notice}
        </p>
      )}
      {current && (
        <FeedbackPanel
          item={current}
          isLast={state.index + 1 >= state.questions.length}
          onNext={next}
        />
      )}
    </div>
  );
}
