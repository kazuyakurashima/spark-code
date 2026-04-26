"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Lesson } from "@/lib/lessons";
import { Lesson1ClearReport } from "./Lesson1ClearReport";

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-slate-900/80 px-1.5 py-0.5 font-mono text-[0.85em] text-pink-300">
      {children}
    </code>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="text-purple-300 not-italic font-medium">{children}</em>
  ),
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-pink-300 underline underline-offset-2"
    >
      {children}
    </a>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc pl-5 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal pl-5 space-y-1">{children}</ol>
  ),
};

type Props = {
  lesson: Lesson;
  currentStepIndex: number;
  onJudge: () => void;
  isJudging: boolean;
  /** localStorage session id; empty during SSR / first render. */
  sessionId: string;
  /** "2周目を始める" button handler from the workspace. */
  onRestart: () => void;
};

export function LessonPanel({
  lesson,
  currentStepIndex,
  onJudge,
  isJudging,
  sessionId,
  onRestart,
}: Props) {
  const currentStep = lesson.steps[currentStepIndex];
  const isLast = currentStepIndex === lesson.steps.length - 1;

  return (
    <div className="h-full p-6 overflow-y-auto text-slate-200 flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-2">
          Lesson {lesson.id}
        </p>
        <h1 className="text-2xl font-bold leading-snug">{lesson.title}</h1>
        <div className="mt-3 text-sm text-slate-400">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {lesson.overview}
          </ReactMarkdown>
        </div>
      </header>

      <ol className="space-y-2">
        {lesson.steps.map((step, idx) => {
          const state =
            idx === currentStepIndex
              ? "current"
              : idx < currentStepIndex
                ? "done"
                : "upcoming";
          return (
            <li
              key={step.id}
              aria-current={state === "current" ? "step" : undefined}
              className={
                state === "current"
                  ? "rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-500/15 to-pink-500/15 p-3 text-sm"
                  : state === "done"
                    ? "rounded-xl border border-transparent p-3 text-sm text-emerald-400"
                    : "rounded-xl border border-transparent p-3 text-sm text-slate-600"
              }
            >
              <span className="font-mono text-xs opacity-70 mr-2">
                {state === "done" ? "✓" : `Step ${step.id}`}
              </span>
              <span className={state === "done" ? "line-through opacity-70" : ""}>
                {step.title}
              </span>
            </li>
          );
        })}
      </ol>

      <section className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-5">
        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">
          今やること
        </p>
        <div className="text-sm text-slate-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {currentStep.instruction}
          </ReactMarkdown>
        </div>
      </section>

      {!isLast && (
        <button
          type="button"
          onClick={onJudge}
          disabled={isJudging}
          aria-label={isJudging ? "先生が確認中" : "答え合わせする"}
          className="mt-auto rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:shadow-purple-500/40 disabled:opacity-60 disabled:cursor-progress disabled:hover:translate-y-0"
        >
          {isJudging ? "先生が確認中…" : "答え合わせする"}
        </button>
      )}

      {isLast && (
        <div className="mt-auto">
          <Lesson1ClearReport sessionId={sessionId} onRestart={onRestart} />
          <p className="mt-3 text-center text-xs text-slate-500">
            次のレッスン(色・余白)は <span className="text-pink-300">Coming Soon</span>
          </p>
        </div>
      )}
    </div>
  );
}
