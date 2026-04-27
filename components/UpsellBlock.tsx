"use client";

import { useState } from "react";

/**
 * §11.4 / §11.5 / §11.7 — Lesson 6 後の SparkPlus 課金導線。
 *
 * Phase 3.1 では Stripe 接続なし(§13.5)。主ボタンクリックは
 * 「準備中です」を学習者向けの言葉で表示するだけのプレースホルダ。
 * §11.3 の方針通り、訴求は「技術」ではなく「伴走と作品成長」に。
 */

type Props = {
  /** 副ボタン「後で考える」を押したときに親へ通知。Lesson6Recap が
   *  受けて課金 CTA セクションを畳む。 */
  onDismiss: () => void;
};

// 課金前メッセージ本文。§11.4 を骨格に、誘導は「Sparkコーチが伴走」
// 「カードを完成」「人にシェア」の 3 ベクトル。
const UPSELL_LEAD = `ここまでで、あなたは Web 制作の全体像を一周できました。

HTML で中身を作り、CSS で見た目を変え、JavaScript で画面を変化させました。
わからないところは Sparkコーチに聞きながら、ここまで進んでこられましたね。

ここから先は、このカードをもっと作品らしく育てていきます。
角丸・影・テーマ色・hover で動く・入力で変わる仕組みまで。
最後にはあなたのカードを世界に公開できます。`;

// 主ボタン onClick 時の placeholder メッセージ(§13.5 の Stripe 不可
// 制約下、開発者ジャーゴン("Phase 3.2" "検証フィードバック")を排し、
// **学習者向けの自然な言葉** で「もうすぐ」を伝える)。
const PLACEHOLDER_NOTICE = `SparkPlus はもうすぐ公開予定です!

ボタンが有効になったら、Lesson 7 から続きを始められるようになります。
それまでは、このページのレッスンをもう一度遊んだり、Sparkコーチに自由に質問してみてください。
楽しみに待っていてくださいね 🎈`;

export function UpsellBlock({ onDismiss }: Props) {
  const [showNotice, setShowNotice] = useState(false);

  const handleUpgradeClick = () => {
    // TODO Phase 3.2: Stripe Checkout に置換する。現状は「もうすぐ」を
    // 学習者向け文言で伝える inline notice にとどめる(§13.5 で本格決済
    // 実装が禁止されているため)。
    setShowNotice(true);
  };

  return (
    <section
      aria-label="SparkPlus への案内"
      className="rounded-2xl border border-pink-500/40 bg-gradient-to-r from-purple-500/15 to-pink-500/15 p-6 space-y-4"
    >
      <h2 className="text-lg font-bold text-white">
        SparkPlus でカードを育てる
      </h2>

      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
        {UPSELL_LEAD}
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
          onClick={onDismiss}
          className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800/60"
        >
          後で考える
        </button>
      </div>

      {showNotice && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl bg-slate-900/60 border border-slate-700/60 p-4 text-sm text-slate-200 leading-relaxed whitespace-pre-line"
        >
          {PLACEHOLDER_NOTICE}
        </div>
      )}
    </section>
  );
}
