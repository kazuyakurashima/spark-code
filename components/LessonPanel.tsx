"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Lesson } from "@/lib/lessons";

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
  onNext: () => void;
};

export function LessonPanel({ lesson, currentStepIndex, onNext }: Props) {
  const currentStep = lesson.steps[currentStepIndex];
  const isLast = currentStepIndex === lesson.steps.length - 1;

  return (
    <div className="h-full p-6 overflow-y-auto text-slate-200 flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-2">
          Lesson {lesson.id}
        </p>
        <h1 className="text-2xl font-bold leading-snug">{lesson.title}</h1>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
          {lesson.overview}
        </p>
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
                    ? "rounded-xl border border-transparent p-3 text-sm text-slate-500"
                    : "rounded-xl border border-transparent p-3 text-sm text-slate-600"
              }
            >
              <span className="font-mono text-xs opacity-70 mr-2">
                Step {step.id}
              </span>
              {step.title}
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
          onClick={onNext}
          className="mt-auto rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:shadow-purple-500/40"
        >
          {/* TODO: 第2段階で AI 判定(judge)に差し替え。今は手動で進む。 */}
          次のステップへ
        </button>
      )}

      {isLast && (
        <div className="mt-auto rounded-xl border border-dashed border-slate-700 p-4 text-center text-sm text-slate-400">
          Lesson 2 は Coming Soon 🚧
        </div>
      )}
    </div>
  );
}
