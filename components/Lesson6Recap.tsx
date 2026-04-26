"use client";

import { useState } from "react";
import type { Lesson } from "@/lib/lessons";

/**
 * 1 周目で扱った 5 要素の振り返り。Lesson 1〜5 と 1:1 で対応する。
 * §6 Lesson 6 の「5 つの要素(名前・自己紹介・リスト・色・動き)」を
 * UI に落とした形。
 */
const ROUND_1_ELEMENTS: ReadonlyArray<{
  lesson: string;
  title: string;
  emoji: string;
  learned: string;
}> = [
  { lesson: "L1", title: "名前", emoji: "📝", learned: "<h1> で見出しを表示する" },
  { lesson: "L2", title: "自己紹介", emoji: "💬", learned: "<p> で文章を表示する" },
  { lesson: "L3", title: "好きなものリスト", emoji: "📋", learned: "<ul> と <li> でリストを作る" },
  { lesson: "L4", title: "色", emoji: "🎨", learned: "<style> で見た目を変える" },
  { lesson: "L5", title: "動き", emoji: "⚡", learned: "textContent で画面を書き換える" },
];

/** §10.2 と §11.4 で言及される 4 役割を、Lesson 6 の総合振り返りで再確認する。 */
const ROLES_OVERVIEW: ReadonlyArray<{
  name: string;
  role: string;
  toneClass: string;
}> = [
  { name: "HTML", role: "中身", toneClass: "text-purple-300" },
  { name: "CSS", role: "見た目", toneClass: "text-pink-300" },
  { name: "JavaScript", role: "動き", toneClass: "text-amber-300" },
  { name: "Sparkコーチ", role: "先生", toneClass: "text-emerald-300" },
];

/**
 * Sparkコーチからの総合振り返り(§6 Lesson 6 例文準拠)。
 * Phase 3.1 では固定文。T15 で苦労度合いに応じて差し替えるテンプレ機構へ拡張する。
 *
 * TODO Phase 3.1 (T15): 学習者の learning_events から effort を分類し、
 *   苦労度合い別に 2-3 種類の文面を切り替える。
 */
const SPARK_COACH_RECAP = `ここまでで、あなたは Web 制作の全体像を一周できました。
HTML で中身を作り、CSS で見た目を変え、JavaScript で画面を変化させました。
わからないところは私(Sparkコーチ)に聞きながら、ここまで進んでこられましたね。

ここから先は、このカードをもっと作品らしく育てていきます。
角丸、影、テーマ色、入力で変わる仕組みまで。
一緒に進みましょう。`;

/**
 * 「未来のカード」予告。§11.6 では「現在のカード vs 完成形」のビジュアル
 * 比較を求めているが、その本格 UI は T18 で実装する。Phase 3.1 のこの段階
 * では「これから何ができるか」を箇条書きで予告するプレースホルダにする。
 *
 * TODO Phase 3.1 (T18): 静的スナップショットとの比較ビジュアル UI に置換する。
 */
const FUTURE_PREVIEW_BULLETS: ReadonlyArray<string> = [
  "角丸と影でカードらしく整える",
  "テーマ色を選んで雰囲気を変える",
  "hover で触ると動くようにする",
  "入力した名前と自己紹介でカードを書き換える",
];

type Props = {
  lesson: Lesson;
};

export function Lesson6Recap({ lesson }: Props) {
  // 「後で考える」を押すと課金 CTA を畳む。学習者の心理的圧迫感を減らす狙い。
  const [showUpsell, setShowUpsell] = useState(true);

  const handleUpgradeClick = () => {
    // TODO Phase 3.1 (T17): UpsellBlock コンポーネントに置換し、
    // 主ボタンの onClick で適切な「準備中」メッセージを出す。
    // TODO Phase 3.2: Stripe Checkout 連携。
    alert(
      "SparkPlus は Phase 3.2 で公開予定です。検証フィードバックをお待ちしています。",
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10 text-slate-100">
        {/* Header */}
        <header className="text-center space-y-2">
          <p className="text-5xl" aria-hidden>
            🎉
          </p>
          <h1 className="text-3xl font-bold leading-snug">
            1 周目クリア!おつかれさま!
          </h1>
          <p className="text-sm text-slate-400">{lesson.title}</p>
        </header>

        {/* 5 element recap */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">
            これまでの 5 つの体験
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {ROUND_1_ELEMENTS.map((el) => (
              <li
                key={el.lesson}
                className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-4 flex gap-3 items-start"
              >
                <span className="text-2xl flex-none" aria-hidden>
                  {el.emoji}
                </span>
                <div>
                  <p className="text-xs font-mono text-slate-500">
                    {el.lesson}: {el.title}
                  </p>
                  <p className="text-sm text-slate-200 mt-0.5">{el.learned}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Roles overview */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-200">
            SparkCode の 4 つの役割
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ROLES_OVERVIEW.map((r) => (
              <div
                key={r.name}
                className="rounded-lg bg-slate-800/40 border border-slate-700/60 p-3 text-center"
              >
                <p className={`font-bold text-sm ${r.toneClass}`}>{r.name}</p>
                <p className="text-xs text-slate-400 mt-1">{r.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sparkコーチ recap */}
        <section className="rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6">
          <p className="text-xs uppercase tracking-widest text-purple-300 font-semibold mb-3">
            Sparkコーチからの振り返り
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-100">
            {SPARK_COACH_RECAP}
          </p>
        </section>

        {/* Future preview placeholder */}
        <section className="rounded-2xl border border-dashed border-slate-700 p-6 space-y-3">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            これから作る未来のカード
          </p>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {FUTURE_PREVIEW_BULLETS.map((b) => (
              <li
                key={b}
                className="flex gap-2 items-start text-slate-200"
              >
                <span className="text-pink-300 flex-none" aria-hidden>
                  ✨
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 italic">
            ※ ビジュアル比較プレビューは T18 で本実装予定
          </p>
        </section>

        {/* Upsell CTA placeholder */}
        {showUpsell && (
          <section className="rounded-2xl border border-pink-500/40 bg-gradient-to-r from-purple-500/15 to-pink-500/15 p-6 space-y-4">
            <h2 className="text-lg font-bold">SparkPlus でカードを育てる</h2>
            <p className="text-sm text-slate-200 leading-relaxed">
              Sparkコーチが、あなたのコードを見ながら、つまずいたところを
              一緒に直します。わからないところは、いつでも聞けます。
              最後にはあなたのカードを世界に公開できます。
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleUpgradeClick}
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:shadow-purple-500/40"
              >
                SparkPlus でカードを育てる(早期応援 月 498 円)
              </button>
              <button
                type="button"
                onClick={() => setShowUpsell(false)}
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800/60"
              >
                後で考える
              </button>
            </div>
            <p className="text-xs text-slate-500 italic">
              ※ Stripe 接続(課金実装)と未来カードの本格 UI は T17 / T18 で
              実装予定。現状は確認用 placeholder。
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
