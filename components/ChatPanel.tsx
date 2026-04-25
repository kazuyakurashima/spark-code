"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/types/chat";

type Props = {
  messages: ChatMessage[];
  onHint: () => void;
  onAsk: (question: string) => void;
  isHinting: boolean;
  isAsking: boolean;
  disableHint?: boolean;
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
    case "error":
      return "⚠ エラー";
    case "question":
    default:
      return "先生";
  }
}

export function ChatPanel({
  messages,
  onHint,
  onAsk,
  isHinting,
  isAsking,
  disableHint = false,
}: Props) {
  const [draft, setDraft] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const trimmedDraft = draft.trim();
  const canSend = trimmedDraft.length > 0 && !isAsking;

  const submit = () => {
    if (!canSend) return;
    onAsk(trimmedDraft);
    setDraft("");
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/70">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80">
        <p className="text-xs uppercase tracking-widest font-semibold text-slate-400">
          AI チャット
        </p>
        <button
          type="button"
          onClick={onHint}
          disabled={isHinting || disableHint}
          className="text-xs px-3 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/40 text-sky-200 transition hover:bg-sky-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          title={disableHint ? "完了済みのレッスンではヒントは不要です" : ""}
        >
          {isHinting ? "考え中…" : "💡 ヒントが欲しい"}
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2"
      >
        {messages.length === 0 ? (
          <div className="m-auto text-center text-slate-500 text-xs">
            <p className="mb-1">話しかけてみよう</p>
            <p>判定 / ヒント / 自由質問が使えます</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
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
          ))
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="border-t border-slate-800/80 p-3 flex gap-2"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="先生に質問してみよう…"
          disabled={isAsking}
          className="flex-1 rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
        >
          {isAsking ? "送信中…" : "送信"}
        </button>
      </form>
    </div>
  );
}
