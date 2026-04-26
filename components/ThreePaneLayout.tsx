import type { ReactNode } from "react";

type Props = {
  left: ReactNode;
  center: ReactNode;
  rightTop: ReactNode;
  rightBottom: ReactNode;
};

/**
 * 3 ペイン本体(左 25% / 中 35% / 右 40% で右は上下 1:1)。
 * 画面全体の高さは外側ラッパー(LessonWorkspace)が `h-screen` + grid-rows
 * で確保し、このコンポーネント自身は `h-full` で残りを埋める。
 */
export function ThreePaneLayout({ left, center, rightTop, rightBottom }: Props) {
  return (
    <div className="h-full w-full grid grid-cols-[25%_35%_40%] bg-slate-950 overflow-hidden">
      <aside className="border-r border-slate-800 overflow-y-auto">{left}</aside>
      <main className="border-r border-slate-800 overflow-hidden flex flex-col">
        {center}
      </main>
      <section className="grid grid-rows-2 overflow-hidden">
        <div className="border-b border-slate-800 overflow-hidden">{rightTop}</div>
        <div className="overflow-hidden">{rightBottom}</div>
      </section>
    </div>
  );
}
