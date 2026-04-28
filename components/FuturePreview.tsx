"use client";

/**
 * §11.6 / §6 Lesson 6 — 「現在のカードサンプル vs 未来のカード」比較表示。
 *
 * 課金導線で SparkPlus の到達点を視覚で見せるための小型プレビュー。
 * Phase 3.1 では学習者の現在コードを動的にレンダリングせず、**1 周目で
 * できあがるシンプル版のサンプル** を左に、**3 周目までで到達する
 * 完成形サンプル** を右に並べる。両方とも Preview と同じ
 * sandbox=""(JS 実行なし)で安全。
 *
 * 未来カード側だけ subtle pulse アニメで「もうすぐ手が届く」感を出す
 * (§6 Lesson 6 の「未来のカードを 1 秒だけ見せる」演出を、繰り返しの
 * 微細な強調に翻訳)。
 */

const PRESENT_HTML = `<style>
  body { margin:0; min-height:100vh; display:grid; place-items:center;
         background:#f8fafc; font-family:"Inter","Noto Sans JP",system-ui,sans-serif;
         color:#1f2937; padding:1rem; box-sizing:border-box; text-align:center; }
  h1 { font-size:1.5rem; font-weight:800; margin:0 0 .5rem; }
  p  { font-size:.875rem; color:#4b5563; line-height:1.5; margin:0 0 .75rem; max-width:24ch; }
  ul { list-style:none; padding:0; margin:0; }
  li { font-size:.8rem; color:#4b5563; padding:.1rem 0; }
</style>
<h1>かず</h1>
<p>水戸の塾で先生をしています</p>
<ul>
  <li>司馬遼太郎</li>
  <li>歴史</li>
  <li>ジャズ</li>
</ul>`;

const FUTURE_HTML = `<style>
  body { margin:0; min-height:100vh; display:grid; place-items:center;
         background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);
         font-family:"Inter","Noto Sans JP",system-ui,sans-serif;
         padding:1rem; box-sizing:border-box; }
  .card { background:linear-gradient(135deg,#6366f1,#a855f7 55%,#ec4899);
          color:#fff; padding:1.25rem 1.5rem; border-radius:1rem;
          box-shadow:0 14px 36px rgba(99,102,241,.35);
          max-width:280px; width:100%; text-align:center; }
  h1 { font-size:1.5rem; font-weight:800; letter-spacing:-.02em; margin:0 0 .35rem; }
  p  { font-size:.85rem; line-height:1.55; opacity:.95; margin:0 0 .9rem; }
  ul { list-style:none; padding:0; margin:0; display:flex; flex-wrap:wrap; gap:.4rem; justify-content:center; }
  li { background:rgba(255,255,255,.22); padding:.18rem .55rem; border-radius:999px;
       font-size:.72rem; font-weight:600; }
</style>
<div class="card">
  <h1>かず</h1>
  <p>水戸の塾で先生をしています</p>
  <ul>
    <li>司馬遼太郎</li>
    <li>歴史</li>
    <li>ジャズ</li>
  </ul>
</div>`;

function buildSrcDoc(body: string): string {
  // viewport meta is required so the iframe contents render at the
  // correct CSS pixel scale on mobile. Without it, narrow screens
  // would zoom the preview down to unreadable desktop scale.
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${body}</body></html>`;
}

export function FuturePreview() {
  return (
    <section
      aria-label="今のカードのサンプルと未来のカードの比較"
      className="space-y-3"
    >
      <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
        今のカードのサンプル → 未来のカード
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
        {/* 現在のカード(1 周目で到達するシンプル版) */}
        <figure className="space-y-1.5">
          <figcaption className="text-[0.7rem] text-slate-400 text-center">
            今のカードのサンプル(1 周目)
          </figcaption>
          <div className="rounded-xl overflow-hidden border border-slate-700/60 aspect-[3/4] bg-white">
            <iframe
              srcDoc={buildSrcDoc(PRESENT_HTML)}
              sandbox=""
              title="今のカードのサンプル"
              className="w-full h-full border-0 block"
            />
          </div>
        </figure>

        {/* 未来のカード(SparkPlus 完了時の完成形サンプル) */}
        <figure className="space-y-1.5">
          <figcaption className="text-[0.7rem] text-pink-300 text-center font-semibold">
            未来のカードのサンプル(3 周目クリア時)
          </figcaption>
          <div className="rounded-xl overflow-hidden border border-pink-500/50 aspect-[3/4] bg-white motion-safe:animate-[future-card-pulse_3s_ease-in-out_infinite]">
            <iframe
              srcDoc={buildSrcDoc(FUTURE_HTML)}
              sandbox=""
              title="未来のカードのサンプル"
              className="w-full h-full border-0 block"
            />
          </div>
        </figure>
      </div>

      <p className="text-center text-xs text-slate-300">
        <span className="text-pink-300" aria-hidden>
          ↑
        </span>{" "}
        <span className="font-semibold text-pink-300">SparkPlus</span> で自分のカードをここまで育てます
      </p>
    </section>
  );
}
