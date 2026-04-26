"use client";

import { useEffect, useState } from "react";
import type { Lesson1Report, Lesson1ReportResponse } from "@/types/report";

type Props = {
  sessionId: string;
  /** Called when the learner clicks "2周目を始める". */
  onRestart: () => void;
};

type FetchState =
  | { kind: "loading" }
  | { kind: "error"; message: string; retry?: () => void }
  | { kind: "ready"; data: Lesson1Report };

function buildToughestSentence(report: Lesson1Report): string {
  const t = report.toughestStep;
  if (!t) return "今回はどのステップもサクッとクリア!すごい集中力。";
  if (t.attempts <= 1) {
    return `「${t.title}」のステップ。1 回でクリア、見事!`;
  }
  return `一番ねばったのは「${t.title}」のステップ。${t.attempts} 回目で自力クリアまで持っていけた、その粘り強さが力になります。`;
}

function buildSmoothestSentence(report: Lesson1Report): string {
  const s = report.smoothestStep;
  if (!s) return "全部のステップに、自分のペースでじっくり向き合ったね。";
  return `一番スムーズだったのは「${s.title}」。コードと画面の対応がしっかり見えていた証拠だよ。`;
}

function buildQuestionSentence(report: Lesson1Report): string {
  const q = report.questionsAsked;
  if (q === 0) {
    return "今回は質問なし。集中して進めましたね!";
  }
  if (q === 1) {
    return "1 回、自分から先生に質問した。学ぶ姿勢、素敵です。";
  }
  return `${q} 回、自分から先生に質問した。学ぶ姿勢、素敵です。`;
}

function buildHintSentence(report: Lesson1Report): string {
  const h = report.hintsUsed;
  if (h === 0) return "ヒントを使わずにクリアできた!立派です。";
  if (h === 1) return "ヒントを 1 回だけ使って、自分で考え抜いてクリア。";
  return `ヒントを ${h} 回使いながら、最後まで自分の手でゴール。`;
}

export function Lesson1ClearReport({ sessionId, onRestart }: Props) {
  const [state, setState] = useState<FetchState>({ kind: "loading" });
  // Bumping this re-runs the fetch effect — used for the "もう一度試す"
  // button when the lesson_completed insert is taking longer than our
  // initial retry budget.
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Reset to loading on every fetch cycle (sessionId change OR retry
    // click). This both shows progress in the UI and disables the
    // retry button (its presence is gated on state.kind === "error").
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ kind: "loading" });

    if (!sessionId) {
      setState({ kind: "error", message: "セッション ID が見つかりません" });
      return;
    }
    // The completion event is fire-and-forget on the workspace side, so
    // a freshly-mounted report component can race the lesson_completed
    // INSERT. Retry up to 3 times with a small backoff if the server
    // hasn't seen lessonCompleted yet — once it does, stop retrying.
    const RETRY_DELAYS_MS = [400, 800, 1500];
    let attempt = 0;

    const fetchOnce = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/report/${encodeURIComponent(sessionId)}`);
        const json = (await res.json()) as Lesson1ReportResponse;
        if (cancelled) return;
        if ("error" in json) {
          setState({ kind: "error", message: json.error });
          return;
        }
        if (!json.lessonCompleted) {
          if (attempt < RETRY_DELAYS_MS.length) {
            const delay = RETRY_DELAYS_MS[attempt];
            attempt += 1;
            timeoutId = setTimeout(() => {
              timeoutId = null;
              if (!cancelled) void fetchOnce();
            }, delay);
            return;
          }
          // Retry budget exhausted but the lesson_completed event still
          // hasn't been recorded. Surface this honestly + offer an
          // in-place retry so the learner doesn't have to reload the
          // page if the insert eventually lands.
          setState({
            kind: "error",
            message:
              "完了イベントの記録がまだ届いていません。少し待ってから「もう一度試す」を押してください。",
            retry: () => setRetryNonce((n) => n + 1),
          });
          return;
        }
        setState({ kind: "ready", data: json });
      } catch (err) {
        if (cancelled) return;
        setState({
          kind: "error",
          message: (err as Error).message || "fetch failed",
        });
      }
    };
    void fetchOnce();
    return () => {
      // Bump cancelled before clearing the timeout so any in-flight
      // fetch's .then callback also bails. The next effect run starts
      // with a fresh `cancelled` flag.
      cancelled = true;
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }, [sessionId, retryNonce]);

  if (state.kind === "loading") {
    return (
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 text-center text-sm text-slate-400">
        集計中…
      </div>
    );
  }
  if (state.kind === "error") {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-center text-sm text-rose-200 space-y-3">
        <p>{state.message}</p>
        {state.retry && (
          <button
            type="button"
            onClick={state.retry}
            className="rounded-lg bg-rose-500/20 border border-rose-500/40 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/30 hover:-translate-y-0.5"
          >
            もう一度試す
          </button>
        )}
      </div>
    );
  }

  const r = state.data;

  return (
    <article className="rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-500/15 via-fuchsia-500/10 to-pink-500/15 p-6 text-slate-100 space-y-4">
      <header className="text-center">
        <p className="text-3xl mb-1" aria-hidden>
          🎉
        </p>
        <h2 className="text-lg font-bold">1 周目クリア!おつかれさま!</h2>
        <p className="mt-1 text-xs text-slate-300">
          あなたは {r.completedSteps} / {r.totalSteps} ステップを完了しました。
        </p>
      </header>

      <ul className="space-y-2 text-sm leading-relaxed">
        <li className="flex gap-2">
          <span aria-hidden>💪</span>
          <span>{buildToughestSentence(r)}</span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden>✨</span>
          <span>{buildSmoothestSentence(r)}</span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden>❓</span>
          <span>{buildQuestionSentence(r)}</span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden>💡</span>
          <span>{buildHintSentence(r)}</span>
        </li>
      </ul>

      <p className="text-sm text-slate-200 leading-relaxed border-t border-slate-700/40 pt-4">
        次は、色と余白を変えて自分らしいカードにしてみましょう。
      </p>

      <button
        type="button"
        onClick={onRestart}
        className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:shadow-purple-500/40"
      >
        2 周目を始める →
      </button>
    </article>
  );
}
