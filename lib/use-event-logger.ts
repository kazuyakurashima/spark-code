"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LearningEventType } from "@/types/supabase";

const SESSION_KEY = "sparkcode.sessionId";
const CODE_CHANGED_THROTTLE_MS = 5_000;

/** Lazy-init the anonymous session id stored in localStorage. */
function ensureSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = window.localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      window.localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    // private browsing, blocked storage etc — skip logging silently
    return "";
  }
}

/** Read-only accessor for code that needs the id (e.g. report fetcher). */
export function getStoredSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

/** Mint a fresh session id and persist it, replacing any prior value. */
function rotateStoredSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const sid = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, sid);
    return sid;
  } catch {
    return "";
  }
}

type EmitInput = {
  eventType: LearningEventType;
  stepId?: string | null;
  metadata?: Record<string, unknown>;
};

async function postLog(
  sessionId: string,
  lessonId: string,
  input: EmitInput,
): Promise<void> {
  if (!sessionId) return; // SSR or storage-blocked: drop silently.
  try {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        lessonId,
        stepId: input.stepId ?? null,
        eventType: input.eventType,
        metadata: input.metadata ?? {},
      }),
      // keepalive lets the request survive a tab close on lesson_completed.
      keepalive: true,
    });
  } catch (err) {
    // Never let logging break the learner experience.
    console.warn("[event-logger]", err);
  }
}

/**
 * Emit-only event logger keyed by the current lesson. The hook owns
 * - session id lifecycle (localStorage)
 * - throttling for code_changed (5s)
 *
 * Callers fire-and-forget; failures are swallowed.
 */
export function useEventLogger(lessonId: string) {
  const [sessionId, setSessionId] = useState<string>("");
  const sessionIdRef = useRef<string>("");
  const lastCodeChangeAtRef = useRef<number>(0);

  useEffect(() => {
    const sid = ensureSessionId();
    sessionIdRef.current = sid;
    // setState in an effect is intentional here: we can't read localStorage
    // during render (SSR has no window), and the value is single-shot —
    // it transitions empty → real exactly once on mount, no loop risk.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionId(sid);
  }, []);

  const emit = useCallback(
    (input: EmitInput) => {
      void postLog(sessionIdRef.current, lessonId, input);
    },
    [lessonId],
  );

  const lessonStarted = useCallback(() => {
    emit({ eventType: "lesson_started" });
  }, [emit]);

  const stepStarted = useCallback(
    (stepId: string) => {
      emit({ eventType: "step_started", stepId });
    },
    [emit],
  );

  const stepCompleted = useCallback(
    (stepId: string, tryCount: number) => {
      emit({
        eventType: "step_completed",
        stepId,
        metadata: { try_count: tryCount },
      });
    },
    [emit],
  );

  const judgeExecuted = useCallback(
    (stepId: string, correct: boolean, tryCount: number) => {
      emit({
        eventType: "judge_executed",
        stepId,
        metadata: { correct, try_count: tryCount },
      });
    },
    [emit],
  );

  const hintRequested = useCallback(
    (stepId: string) => {
      emit({ eventType: "hint_requested", stepId });
    },
    [emit],
  );

  const questionAsked = useCallback(
    (stepId: string, question: string) => {
      emit({
        eventType: "question_asked",
        stepId,
        // Cap stored question text to keep metadata small.
        metadata: { question: question.slice(0, 500) },
      });
    },
    [emit],
  );

  const codeChanged = useCallback(
    (stepId: string, chars: number) => {
      const now = Date.now();
      if (now - lastCodeChangeAtRef.current < CODE_CHANGED_THROTTLE_MS) return;
      lastCodeChangeAtRef.current = now;
      emit({ eventType: "code_changed", stepId, metadata: { chars } });
    },
    [emit],
  );

  const lessonCompleted = useCallback(() => {
    emit({ eventType: "lesson_completed" });
  }, [emit]);

  /**
   * Mint a fresh session id and replace the stored one. Use this when the
   * learner restarts a lesson — subsequent emits go to the new id, and the
   * report fetcher (keyed on the same id) naturally scopes to this round.
   * Returns the new id so callers can drive UI off it synchronously.
   */
  const resetSession = useCallback((): string => {
    const next = rotateStoredSessionId();
    sessionIdRef.current = next;
    setSessionId(next);
    return next;
  }, []);

  return {
    sessionId,
    lessonStarted,
    stepStarted,
    stepCompleted,
    judgeExecuted,
    hintRequested,
    questionAsked,
    codeChanged,
    lessonCompleted,
    resetSession,
  };
}
