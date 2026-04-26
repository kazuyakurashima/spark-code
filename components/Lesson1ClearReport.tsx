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
  | { kind: "error"; message: string }
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

  useEffect(() => {
    let cancelled = false;
    if (!sessionId) {
      // setState in an effect here is intentional: the parent re-renders
      // once the session id resolves from localStorage, and we want to
      // reflect that transition in the panel.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ kind: "error", message: "セッション ID が見つかりません" });
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/report/${encodeURIComponent(sessionId)}`);
        const json = (await res.json()) as Lesson1ReportResponse;
        if (cancelled) return;
        if ("error" in json) {
          setState({ kind: "error", message: json.error });
        } else {
          setState({ kind: "ready", data: json });
        }
      } catch (err) {
        if (cancelled) return;
        setState({
          kind: "error",
          message: (err as Error).message || "fetch failed",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (state.kind === "loading") {
    return (
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 text-center text-sm text-slate-400">
        集計中…
      </div>
    );
  }
  if (state.kind === "error") {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-center text-sm text-rose-200">
        レポートを読み込めませんでした({state.message})。
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
