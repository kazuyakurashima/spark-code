import { Fragment } from "react";
import type { Lesson, LessonRound } from "@/lib/lessons";

/** §10.2: 現在地表示バー。画面上部に常時表示。
 *
 * 三段構成:
 *  - 上段: 1 周目 / 2 周目 / 3 周目 の進行表示(現在の周をハイライト)
 *  - 中段: Lesson X / N : <title>
 *  - 下段: 4 役割の凡例(HTML=中身 / CSS=見た目 / JS=動き / Sparkコーチ=先生)
 *
 * 60 代視点に配慮し、凡例は text-sm(14px) を下限に。狭い画面では
 * 凡例だけ折り返す。
 */
type Props = {
  lesson: Lesson;
  /** 全レッスン数。Phase 3 完成時は 16。Phase 3.1 では現状の lesson 配列を渡す。 */
  totalLessons: number;
};

const ROUNDS: ReadonlyArray<{ num: LessonRound; theme: string }> = [
  { num: 1, theme: "全体像" },
  { num: 2, theme: "整える" },
  { num: 3, theme: "動かす" },
];

const ROLES: ReadonlyArray<{ name: string; role: string; toneClass: string }> =
  [
    { name: "HTML", role: "中身", toneClass: "text-purple-300" },
    { name: "CSS", role: "見た目", toneClass: "text-pink-300" },
    { name: "JS", role: "動き", toneClass: "text-amber-300" },
    { name: "Sparkコーチ", role: "先生", toneClass: "text-emerald-300" },
  ];

export function LocationBar({ lesson, totalLessons }: Props) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/85 backdrop-blur px-4 sm:px-6 py-2 flex flex-col gap-1.5">
      {/* 上段: 周回プログレッション */}
      <nav
        aria-label="3 周構成のうち現在の周"
        className="flex flex-wrap items-center gap-x-1.5 gap-y-1"
      >
        {ROUNDS.map((r, i) => {
          const state =
            r.num === lesson.round
              ? "current"
              : r.num < lesson.round
                ? "done"
                : "upcoming";
          const className =
            state === "current"
              ? "px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold shadow shadow-purple-500/20"
              : state === "done"
                ? "px-2.5 py-0.5 rounded-full text-slate-400 text-xs font-medium"
                : "px-2.5 py-0.5 rounded-full text-slate-600 text-xs";
          return (
            <Fragment key={r.num}>
              <span
                className={className}
                aria-current={state === "current" ? "step" : undefined}
              >
                {r.num} 周目 [{r.theme}]
              </span>
              {i < ROUNDS.length - 1 && (
                <span className="text-slate-700 text-xs" aria-hidden>
                  »
                </span>
              )}
            </Fragment>
          );
        })}
      </nav>

      {/* 中段: 現在 Lesson の番号 + タイトル */}
      <p className="flex items-baseline gap-2 text-slate-100">
        <span className="font-mono text-xs text-purple-300">
          Lesson {lesson.id} / {totalLessons}
        </span>
        <span className="text-sm font-semibold leading-tight">
          {lesson.title}
        </span>
      </p>

      {/* 下段: 4 役割凡例(60 代視点で text-sm 確保) */}
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
        {ROLES.map((r, i) => (
          <Fragment key={r.name}>
            <span>
              <span className={`${r.toneClass} font-semibold`}>{r.name}</span>
              <span className="mx-1 text-slate-600">=</span>
              <span className="text-slate-300">{r.role}</span>
            </span>
            {i < ROLES.length - 1 && (
              <span className="text-slate-700" aria-hidden>
                /
              </span>
            )}
          </Fragment>
        ))}
      </p>
    </header>
  );
}
