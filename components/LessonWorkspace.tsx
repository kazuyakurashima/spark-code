"use client";

import { useCallback, useState } from "react";
import { getLesson } from "@/lib/lessons";
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

async function callChat(body: object): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok && res.status !== 400) {
    // Even on 4xx/5xx the route returns a typed JSON body, but guard
    // against opaque failures (network drop etc).
    throw new Error(`HTTP ${res.status}`);
  }
  return (await res.json()) as ChatResponse;
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

  const appendMessage = useCallback((m: ChatMessage) => {
    setMessages((prev) => [...prev, m]);
  }, []);

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
  }, [busy, isLastStep, currentStep.id, code, appendMessage, lesson.steps.length]);

  // Step 9 will wire these to ChatPanel; defining them now keeps the API stable.
  const handleHint = useCallback(async () => {
    if (busy) return;
    if (isLastStep) return;
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
  }, [busy, isLastStep, currentStep.id, code, appendMessage]);

  const handleQuestion = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (busy || trimmed.length === 0) return;
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
    [busy, currentStep.id, code, appendMessage],
  );

  return (
    <ThreePaneLayout
      left={
        <LessonPanel
          lesson={lesson}
          currentStepIndex={stepIndex}
          onJudge={handleJudge}
          isJudging={busy === "judge"}
        />
      }
      center={<CodeEditor value={code} onChange={setCode} />}
      rightTop={<Preview code={code} previewCss={lesson.previewCss} />}
      rightBottom={
        <ChatPanel
          messages={messages}
          onHint={handleHint}
          onAsk={handleQuestion}
          isHinting={busy === "hint"}
          isAsking={busy === "question"}
          disableHint={isLastStep}
        />
      }
    />
  );
}
