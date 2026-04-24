"use client";

export function ChatPanel() {
  return (
    <div className="h-full p-4 bg-slate-900/70">
      <div className="h-full rounded-xl border border-dashed border-slate-700 grid place-items-center text-center text-slate-500 text-sm p-4">
        <div>
          <p className="font-semibold text-slate-300 mb-1">AI チャット</p>
          <p className="text-xs">
            ヒント・質問・褒めは第 2 段階で実装します
          </p>
        </div>
      </div>
    </div>
  );
}
