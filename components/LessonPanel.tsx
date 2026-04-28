"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Lesson } from "@/lib/lessons";
import { Confetti } from "./Confetti";
import { LessonClearReport } from "./LessonClearReport";

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
  /** T28 — explicit "次のステップに進む" CTA(judge 合格後だけ有効). */
  onAdvance: () => void;
  isJudging: boolean;
  /** localStorage session id; empty during SSR / first render. */
  sessionId: string;
  /** "もう一度挑戦する" button handler from the workspace. */
  onRestart: () => void;
  /**
   * Set when judge has just advanced the learner one step. The panel
   * shows a transient banner above the instruction so the transition
   * isn't silent. Cleared by the workspace after a few seconds.
   */
  advanceNotice: { fromTitle: string; toStepId: string; toTitle: string } | null;
  /**
   * T28 — judge が現在のステップで通った直後の中間状態を示す。
   * `passedStepId === currentStep.id` のとき、判定 CTA は緑グラデの
   * 「次のステップに進む →」に切り替わる。ナビ click で workspace 側が
   * null に戻し、新しいステップでまた「答え合わせする」が出る。
   */
  passedStepId: string | null;
};

export function LessonPanel({
  lesson,
  currentStepIndex,
  onJudge,
  onAdvance,
  isJudging,
  sessionId,
  onRestart,
  advanceNotice,
  passedStepId,
}: Props) {
  const currentStep = lesson.steps[currentStepIndex];
  const isLast = currentStepIndex === lesson.steps.length - 1;
  // T28 — このステップを judge 通過したが、まだ次ステップに移っていない
  // 中間状態。CTA が緑グラデの「次のステップに進む →」に切り替わり、
  // 紙吹雪も走る。
  //
  // T28 follow-up: 最後の judge ステップが通った場合は workspace 側で
  // 直接 setStepIndex(last) が走り passedStepId は立たない(LessonClear
  // Report の祝祭に一本化)。よって isPassedHere が true なのは必ず
  // *中間* 遷移時のみで、紙吹雪と進行 CTA は素直に出してよい。
  const isPassedHere = passedStepId === currentStep.id;

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

      {advanceNotice && (
        <div
          // Re-key on toStepId so React re-mounts the node and the
          // fade-in animation replays for back-to-back advances.
          key={advanceNotice.toStepId}
          role="status"
          aria-live="polite"
          className="rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-br from-emerald-500/20 to-teal-500/15 p-5 motion-safe:animate-[fade-in-down_300ms_ease-out_both]"
        >
          <div className="flex items-start gap-3">
            <span
              className="text-3xl motion-safe:animate-[check-pop_500ms_ease-out_both]"
              aria-hidden
            >
              🎉
            </span>
            <div className="flex-1">
              <p className="text-base font-bold text-emerald-100">
                {advanceNotice.fromTitle} クリア!
              </p>
              <p className="text-sm text-emerald-200/90 mt-1">
                次は{" "}
                <span className="font-mono text-xs opacity-80">
                  Step {advanceNotice.toStepId}
                </span>{" "}
                「{advanceNotice.toTitle}」
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* T28 — judge 通過直後だけ confetti を出す。`key={currentStep.id}`
          で remount を強制し、次ステップで passedStepId が立ったときに
          再度アニメが走る。最後の judge ステップが通ったケースは
          workspace が直接 clear 画面に飛ばすので、ここは中間遷移専用。 */}
      {isPassedHere && <Confetti key={currentStep.id} pieces={35} />}

      {!isLast &&
        (isPassedHere ? (
          <button
            type="button"
            onClick={onAdvance}
            aria-label="次のステップに進む"
            className="mt-auto rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-emerald-500/50 motion-safe:animate-[pass-pulse_900ms_ease-out]"
          >
            🎉 次のステップに進む →
          </button>
        ) : (
          <button
            type="button"
            onClick={onJudge}
            disabled={isJudging}
            aria-label={isJudging ? "先生が確認中" : "答え合わせする"}
            className="mt-auto rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:shadow-purple-500/40 disabled:opacity-60 disabled:cursor-progress disabled:hover:translate-y-0"
          >
            {isJudging ? "先生が確認中…" : "答え合わせする"}
          </button>
        ))}

      {isLast && (
        <div className="mt-auto">
          <LessonClearReport
            lesson={lesson}
            sessionId={sessionId}
            onRestart={onRestart}
          />
        </div>
      )}
    </div>
  );
}
