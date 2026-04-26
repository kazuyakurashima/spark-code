"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLesson } from "@/lib/lessons";
import { useEventLogger } from "@/lib/use-event-logger";
import type { ChatMessage, ChatResponse } from "@/types/chat";
import { ThreePaneLayout } from "./ThreePaneLayout";
import { LessonPanel } from "./LessonPanel";
import { ChatPanel } from "./ChatPanel";
import { Preview } from "./Preview";
import { CodeEditor } from "./CodeEditor";

type BusyKind = "judge" | "hint" | "question" | null;

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function isChatResponse(value: unknown): value is ChatResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.message !== "string") return false;
  switch (v.type) {
    case "judge":
      return typeof v.correct === "boolean";
    case "hint":
    case "praise":
    case "question":
    case "error":
      return true;
    default:
      return false;
  }
}

async function callChat(body: object): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  // /api/chat always tries to return a typed JSON body — including on 4xx/5xx.
  // Prefer the server's message, but only after we've verified the shape:
  // an upstream proxy or framework error could return a JSON payload that
  // doesn't match our wire format.
  let parsed: unknown;
  try {
    parsed = await res.json();
  } catch {
    throw new Error(`HTTP ${res.status} (no JSON body)`);
  }
  if (!isChatResponse(parsed)) {
    throw new Error(`HTTP ${res.status} (unexpected response shape)`);
  }
  return parsed;
}

export function LessonWorkspace({ lessonId }: { lessonId: number }) {
  const lesson = getLesson(lessonId);
  if (!lesson) {
    throw new Error(`Lesson ${lessonId} not found`);
  }

  const [code, setCode] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState<BusyKind>(null);

  const currentStep = lesson.steps[stepIndex];
  const isLastStep = stepIndex === lesson.steps.length - 1;

  const log = useEventLogger(String(lesson.id));
  // Per-step judge attempt counter; baked into judge_executed.try_count
  // and step_completed.try_count so the report doesn't have to count
  // events itself.
  const judgeAttemptsRef = useRef<Record<string, number>>({});
  const lessonStartedRef = useRef(false);
  const lessonCompletedRef = useRef(false);
  const prevStepIdRef = useRef<string>(currentStep.id);

  // First-mount: lesson_started + step_started for the initial step.
  useEffect(() => {
    if (lessonStartedRef.current) return;
    lessonStartedRef.current = true;
    log.lessonStarted();
    log.stepStarted(currentStep.id);
    // Intentionally only run once per LessonWorkspace mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step transitions: emit step_completed for the previous step and
  // step_started for the new one. lesson_completed fires once when we
  // first reach the last step.
  useEffect(() => {
    const prevId = prevStepIdRef.current;
    if (prevId !== currentStep.id) {
      const tryCount = judgeAttemptsRef.current[prevId] ?? 1;
      log.stepCompleted(prevId, tryCount);
      log.stepStarted(currentStep.id);
      prevStepIdRef.current = currentStep.id;
    }
    if (isLastStep && !lessonCompletedRef.current) {
      lessonCompletedRef.current = true;
      log.lessonCompleted();
    }
  }, [currentStep.id, isLastStep, log]);

  const appendMessage = useCallback((m: ChatMessage) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  // Wrap setCode so code edits flow into the throttled code_changed log.
  const handleCodeChange = useCallback(
    (next: string) => {
      setCode(next);
      log.codeChanged(currentStep.id, next.length);
    },
    [log, currentStep.id],
  );

  const handleJudge = useCallback(async () => {
    if (busy || isLastStep) return;
    // Empty-code guard: skip the round trip and surface a friendly nudge.
    if (code.trim().length === 0) {
      appendMessage({
        id: newId(),
        role: "assistant",
        kind: "error",
        content:
          "まずはエディタにコードを書いてみよう。書けたら「次のステップへ」を押してね。",
      });
      return;
    }
    setBusy("judge");
    try {
      const resp = await callChat({
        type: "judge",
        stepId: currentStep.id,
        code,
      });
      if (resp.type === "judge") {
        const tryCount =
          (judgeAttemptsRef.current[currentStep.id] ?? 0) + 1;
        judgeAttemptsRef.current[currentStep.id] = tryCount;
        log.judgeExecuted(currentStep.id, resp.correct, tryCount);
        appendMessage({
          id: newId(),
          role: "assistant",
          kind: "judge",
          correct: resp.correct,
          content: resp.message,
        });
        if (resp.correct) {
          // Advance the step immediately. praise is best-effort: judge is the
          // source of truth, so a praise failure must NOT roll back progress.
          const judgedStepId = currentStep.id;
          const judgedCode = code;
          setStepIndex((i) => Math.min(i + 1, lesson.steps.length - 1));
          callChat({ type: "praise", stepId: judgedStepId, code: judgedCode })
            .then((praiseResp) => {
              if (praiseResp.type === "praise") {
                appendMessage({
                  id: newId(),
                  role: "assistant",
                  kind: "praise",
                  content: praiseResp.message,
                });
              }
              // Silently swallow other shapes; default praise was already
              // delivered through the judge message bubble.
            })
            .catch((err) => {
              console.warn("[chat] praise failed:", err);
            });
        }
      } else {
        appendMessage({
          id: newId(),
          role: "assistant",
          kind: "error",
          content: resp.message,
        });
      }
    } catch (err) {
      appendMessage({
        id: newId(),
        role: "assistant",
        kind: "error",
        content: `判定リクエストに失敗しました(${(err as Error).message})。少し待ってから再度試してください。`,
      });
    } finally {
      setBusy(null);
    }
  }, [busy, isLastStep, currentStep.id, code, appendMessage, log, lesson.steps.length]);

  const handleHint = useCallback(async () => {
    if (busy) return;
    if (isLastStep) return;
    log.hintRequested(currentStep.id);
    setBusy("hint");
    try {
      const resp = await callChat({
        type: "hint",
        stepId: currentStep.id,
        code,
      });
      if (resp.type === "hint") {
        appendMessage({
          id: newId(),
          role: "assistant",
          kind: "hint",
          content: resp.message,
        });
      } else {
        appendMessage({
          id: newId(),
          role: "assistant",
          kind: "error",
          content: resp.message,
        });
      }
    } catch (err) {
      appendMessage({
        id: newId(),
        role: "assistant",
        kind: "error",
        content: `ヒント取得に失敗しました(${(err as Error).message})。`,
      });
    } finally {
      setBusy(null);
    }
  }, [busy, isLastStep, currentStep.id, code, appendMessage, log]);

  const handleQuestion = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (busy || trimmed.length === 0) return;
      log.questionAsked(currentStep.id, trimmed);
      setBusy("question");
      appendMessage({
        id: newId(),
        role: "user",
        kind: "question",
        content: trimmed,
      });
      try {
        const resp = await callChat({
          type: "question",
          stepId: currentStep.id,
          code,
          question: trimmed,
        });
        if (resp.type === "question") {
          appendMessage({
            id: newId(),
            role: "assistant",
            kind: "question",
            content: resp.message,
          });
        } else {
          appendMessage({
            id: newId(),
            role: "assistant",
            kind: "error",
            content: resp.message,
          });
        }
      } catch (err) {
        appendMessage({
          id: newId(),
          role: "assistant",
          kind: "error",
          content: `質問の送信に失敗しました(${(err as Error).message})。`,
        });
      } finally {
        setBusy(null);
      }
    },
    [busy, currentStep.id, code, appendMessage, log],
  );

  // "2周目を始める" → reset workspace state AND mint a fresh session id.
  // Round-1 events stay in the DB but become unreferenced from the UI;
  // the next round's events (and the next clear report) are scoped to
  // the new session id, so the report shows this attempt only.
  const handleRestart = useCallback(() => {
    setCode("");
    setMessages([]);
    setStepIndex(0);
    judgeAttemptsRef.current = {};
    lessonStartedRef.current = false;
    lessonCompletedRef.current = false;
    prevStepIdRef.current = lesson.steps[0].id;
    log.resetSession();
    // Re-emit lesson_started + step_started for the new round so the
    // next report has the correct scope.
    log.lessonStarted();
    log.stepStarted(lesson.steps[0].id);
  }, [lesson.steps, log]);

  return (
    <ThreePaneLayout
      left={
        <LessonPanel
          lesson={lesson}
          currentStepIndex={stepIndex}
          onJudge={handleJudge}
          isJudging={busy === "judge"}
          sessionId={log.sessionId}
          onRestart={handleRestart}
        />
      }
      center={<CodeEditor value={code} onChange={handleCodeChange} />}
      rightTop={<Preview code={code} previewCss={lesson.previewCss} />}
      rightBottom={
        <ChatPanel
          messages={messages}
          onHint={handleHint}
          onAsk={handleQuestion}
          isHinting={busy === "hint"}
          isAsking={busy === "question"}
          isBusy={busy !== null}
          disableHint={isLastStep}
        />
      }
    />
  );
}
