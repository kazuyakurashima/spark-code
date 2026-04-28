"use client";

import { useState } from "react";

/**
 * T28 — 合格時の紙吹雪。CSS のみで実装(canvas-confetti のような外部
 * 依存を入れない)。`@keyframes confetti-fall` は globals.css 側に置く。
 *
 * - `motion-reduce:hidden` でアニメ嫌いユーザは丸ごと非表示
 * - `pointer-events-none` でボタン操作を妨げない
 * - 親が unmount すれば DOM ごと消える(particle のクリーンアップ不要)
 *
 * 使い方: 祝いたいタイミングで `<Confetti />` を一度だけ render。
 * 同じ親で表示している間はアニメは再生されないので、re-trigger したい
 * ときは `key` を変えて再 mount する。
 */

const COLORS = [
  "#a855f7", // purple-500
  "#ec4899", // pink-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#f43f5e", // rose-500
];

type Props = {
  /** 紙吹雪の枚数。中規模(40)を既定、レッスン全クリアでは多めに。 */
  pieces?: number;
};

export function Confetti({ pieces = 40 }: Props) {
  // Lazy initializer: React-hooks purity allows side effects in the
  // useState init callback (it runs once on first mount). useMemo
  // would flag the Math.random() calls. We don't need to recompute
  // on `pieces` change because the component is meant to be remounted
  // (via a fresh key prop) when the caller wants a new burst.
  const [items] = useState(() =>
    Array.from({ length: pieces }, (_, i) => ({
      id: i,
      // %-based horizontal scatter so the burst spans the viewport width
      left: Math.random() * 100,
      // small stagger so they don't all land at the same instant
      delay: Math.random() * 0.4,
      // varied fall speed for a less mechanical feel
      duration: 2 + Math.random() * 1.5,
      color: COLORS[i % COLORS.length],
    })),
  );

  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden motion-reduce:hidden"
    >
      {items.map((p) => (
        <span
          key={p.id}
          style={{
            left: `${p.left}%`,
            top: "-20px",
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ease-out ${p.delay}s forwards`,
          }}
          className="absolute w-2 h-3.5 rounded-sm"
        />
      ))}
    </div>
  );
}
