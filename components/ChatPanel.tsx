"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/types/chat";

const QUESTION_MAX_LENGTH = 500;

type Props = {
  messages: ChatMessage[];

  // §9.3 / T14 — 5 つの常設ボタンに対応する Sparkコーチハンドラ。
  onHint: () => void;
  onDiagnose: () => void;
  onExplain: () => void;
  onSummary: () => void;
  onImprove: () => void;
  onAsk: (question: string) => void;

  // 各ボタン個別の busy フラグ(ボタンラベル切替用)。
  isHinting: boolean;
  isDiagnosing: boolean;
  isExplaining: boolean;
  isSummarizing: boolean;
  isImproving: boolean;
  isAsking: boolean;

  /**
   * True while *any* AI flow is in flight. すべての input をここで gate
   * するので、学習者は重複リクエストを投げられない。
   */
  isBusy: boolean;

  /** Lesson 6 (recap) や 既に最終ステップに到達した場面で hint / diagnose
   *  を非アクティブ化するためのフラグ。 */
  disableHint?: boolean;
  disableDiagnose?: boolean;
};

const messageMarkdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-slate-950/70 px-1 py-0.5 font-mono text-[0.85em] text-pink-300">
      {children}
    </code>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
};

function bubbleClass(message: ChatMessage): string {
  const base =
    "rounded-xl px-3 py-2 text-sm leading-relaxed max-w-[90%] break-words";
  if (message.role === "user") {
    return `${base} bg-slate-700/70 text-slate-100 self-end`;
  }
  switch (message.kind) {
    case "judge":
      return message.correct
        ? `${base} bg-emerald-500/15 border border-emerald-500/40 text-emerald-100 self-start`
        : `${base} bg-amber-500/15 border border-amber-500/40 text-amber-100 self-start`;
    case "praise":
      return `${base} bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-pink-500/40 text-pink-100 self-start`;
    case "hint":
      return `${base} bg-sky-500/15 border border-sky-500/40 text-sky-100 self-start`;
    case "diagnose":
      return `${base} bg-amber-500/10 border border-amber-500/30 text-amber-50 self-start`;
    case "explain":
      return `${base} bg-violet-500/15 border border-violet-500/40 text-violet-100 self-start`;
    case "improve":
      return `${base} bg-emerald-500/15 border border-emerald-500/40 text-emerald-100 self-start`;
    case "summary":
      return `${base} bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-pink-500/30 text-pink-50 self-start`;
    case "error":
      return `${base} bg-rose-500/15 border border-rose-500/40 text-rose-100 self-start`;
    case "question":
    default:
      return `${base} bg-slate-800/80 border border-slate-700/60 text-slate-200 self-start`;
  }
}

function bubbleLabel(message: ChatMessage): string | null {
  if (message.role === "user") return null;
  switch (message.kind) {
    case "judge":
      return message.correct ? "✓ 正解" : "もう少し";
    case "praise":
      return "🎉 グッジョブ!";
    case "hint":
      return "💡 ヒント";
    case "diagnose":
      return "🔍 どこが違う?";
    case "explain":
      return "📖 やさしく説明";
    case "improve":
      return "🎯 もっと良くしたい";
    case "summary":
      return "✨ できたこと";
    case "error":
      return "⚠ エラー";
    case "three-points":
      return null; // three-points は専用カードに切り出すのでラベル不要
    case "question":
    default:
      return "先生";
  }
}

/**
 * §3.4 / §10.5: レッスン完了時の 3 点セットは、他のメッセージバブル
 * とは明確に差別化された「大きいお祝いカード」で出す。Lesson6Recap の
 * 入口に対する小サイズ版という位置づけ。
 */
function ThreePointsCard({ message }: { message: ChatMessage }) {
  const tps = message.threePoints;
  if (!tps) return null;
  const sections: ReadonlyArray<{ icon: string; title: string; body: string }> =
    [
      { icon: "🪄", title: "今日できるようになったこと", body: tps.didLearn },
      { icon: "🌱", title: "あなたのカードの進化", body: tps.cardEvolved },
      { icon: "🎁", title: "次の楽しみ", body: tps.nextFun },
    ];
  return (
    <article className="self-stretch rounded-2xl border border-pink-500/40 bg-gradient-to-br from-purple-500/15 via-fuchsia-500/10 to-pink-500/15 p-4 space-y-3 shadow-lg shadow-purple-500/10">
      <header className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          🎉
        </span>
        <h3 className="text-sm font-bold text-white">レッスン完了!3 点セット</h3>
      </header>
      <ul className="space-y-2">
        {sections.map((s) => (
          <li key={s.title} className="flex gap-2 items-start text-sm">
            <span className="text-base flex-none mt-0.5" aria-hidden>
              {s.icon}
            </span>
            <div>
              <p className="text-[0.7rem] uppercase tracking-widest text-pink-300/90 font-semibold mb-0.5">
                {s.title}
              </p>
              <div className="text-slate-100 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={messageMarkdownComponents}
                >
                  {s.body}
                </ReactMarkdown>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

/** §9.3 の 5 ボタンを 2x3 グリッド + 5 つ目フル幅で並べる(暗黙判断 2)。 */
function QuickActions(props: {
  onHint: () => void;
  onDiagnose: () => void;
  onExplain: () => void;
  onSummary: () => void;
  onImprove: () => void;
  isHinting: boolean;
  isDiagnosing: boolean;
  isExplaining: boolean;
  isSummarizing: boolean;
  isImproving: boolean;
  isBusy: boolean;
  disableHint: boolean;
  disableDiagnose: boolean;
}) {
  const baseBtn =
    "rounded-lg px-2 py-1.5 text-xs font-medium transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed border";

  return (
    <div className="grid grid-cols-2 gap-1.5 px-3 py-2 border-b border-slate-800/80">
      <button
        type="button"
        onClick={props.onHint}
        disabled={props.isBusy || props.disableHint}
        className={`${baseBtn} bg-sky-500/15 border-sky-500/40 text-sky-200 hover:bg-sky-500/25`}
        title={props.disableHint ? "完了済みのレッスンでは使えません" : ""}
      >
        {props.isHinting ? "考え中…" : "💡 ヒントが欲しい"}
      </button>
      <button
        type="button"
        onClick={props.onDiagnose}
        disabled={props.isBusy || props.disableDiagnose}
        className={`${baseBtn} bg-amber-500/15 border-amber-500/40 text-amber-200 hover:bg-amber-500/25`}
        title={
          props.disableDiagnose
            ? "完了済みのレッスンでは使えません"
            : "今のコードと正解を比べて、違いを 1 か所だけ教えます(進行は起きません)"
        }
      >
        {props.isDiagnosing ? "考え中…" : "🔍 どこが違う?"}
      </button>
      <button
        type="button"
        onClick={props.onExplain}
        disabled={props.isBusy}
        className={`${baseBtn} bg-violet-500/15 border-violet-500/40 text-violet-200 hover:bg-violet-500/25`}
      >
        {props.isExplaining ? "考え中…" : "📖 やさしく説明して"}
      </button>
      <button
        type="button"
        onClick={props.onSummary}
        disabled={props.isBusy}
        className={`${baseBtn} bg-pink-500/15 border-pink-500/40 text-pink-200 hover:bg-pink-500/25`}
      >
        {props.isSummarizing ? "考え中…" : "✨ できたことを教えて"}
      </button>
      <button
        type="button"
        onClick={props.onImprove}
        disabled={props.isBusy}
        className={`${baseBtn} col-span-2 bg-emerald-500/15 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/25`}
      >
        {props.isImproving ? "考え中…" : "🎯 もっと良くしたい"}
      </button>
    </div>
  );
}

export function ChatPanel({
  messages,
  onHint,
  onDiagnose,
  onExplain,
  onSummary,
  onImprove,
  onAsk,
  isHinting,
  isDiagnosing,
  isExplaining,
  isSummarizing,
  isImproving,
  isAsking,
  isBusy,
  disableHint = false,
  disableDiagnose = false,
}: Props) {
  const [draft, setDraft] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const trimmedDraft = draft.trim();
  const canSend = trimmedDraft.length > 0 && !isBusy;

  const submit = () => {
    if (!canSend) return;
    onAsk(trimmedDraft);
    setDraft("");
  };

  const showThinking =
    isHinting ||
    isAsking ||
    isDiagnosing ||
    isExplaining ||
    isSummarizing ||
    isImproving;

  return (
    <div className="h-full flex flex-col bg-slate-900/70">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80">
        <p className="text-xs uppercase tracking-widest font-semibold text-slate-400">
          Sparkコーチ
        </p>
      </div>

      <QuickActions
        onHint={onHint}
        onDiagnose={onDiagnose}
        onExplain={onExplain}
        onSummary={onSummary}
        onImprove={onImprove}
        isHinting={isHinting}
        isDiagnosing={isDiagnosing}
        isExplaining={isExplaining}
        isSummarizing={isSummarizing}
        isImproving={isImproving}
        isBusy={isBusy}
        disableHint={disableHint}
        disableDiagnose={disableDiagnose}
      />

      <div
        ref={scrollerRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-label="先生とのチャット履歴"
        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2"
      >
        {messages.length === 0 ? (
          <div className="m-auto text-center text-slate-500 text-xs">
            <p className="mb-1">先生に話しかけてみよう</p>
            <p>上のボタンか、下の入力欄からどうぞ</p>
          </div>
        ) : (
          messages.map((m) => {
            // 3 点セットは専用カードで全幅表示。それ以外は従来のバブル。
            if (m.kind === "three-points") {
              return <ThreePointsCard key={m.id} message={m} />;
            }
            return (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                {bubbleLabel(m) && (
                  <span className="text-[0.65rem] uppercase tracking-widest text-slate-500 mb-0.5 px-1">
                    {bubbleLabel(m)}
                  </span>
                )}
                <div className={bubbleClass(m)}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={messageMarkdownComponents}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })
        )}
        {showThinking && (
          <div className="flex items-start">
            <div className="rounded-xl px-3 py-2 bg-slate-800/60 border border-slate-700/40 text-slate-400 text-sm flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
              </span>
              <span>先生が考え中…</span>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="border-t border-slate-800/80 p-3 flex flex-col gap-2"
      >
        <div className="flex gap-2 items-end">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={
              isBusy
                ? "先生が考え中…"
                : "自由に質問してみよう…(Enter で送信、Shift+Enter で改行)"
            }
            rows={2}
            disabled={isBusy}
            maxLength={QUESTION_MAX_LENGTH}
            className="flex-1 resize-none rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
          >
            {isAsking ? "送信中…" : "送信"}
          </button>
        </div>
        <p
          className={`text-[0.65rem] text-right ${
            draft.length > QUESTION_MAX_LENGTH * 0.9
              ? "text-amber-400"
              : "text-slate-500"
          }`}
        >
          {draft.length} / {QUESTION_MAX_LENGTH}
        </p>
      </form>
    </div>
  );
}
