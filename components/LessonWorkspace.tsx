"use client";

import { useState } from "react";
import type { Lesson } from "@/lib/lessons";
import { ThreePaneLayout } from "./ThreePaneLayout";
import { LessonPanel } from "./LessonPanel";
import { ChatPanel } from "./ChatPanel";

export function LessonWorkspace({ lesson }: { lesson: Lesson }) {
  const [code, setCode] = useState("");
  const [stepIndex, setStepIndex] = useState(0);

  // TODO: 第2段階で AI judge の結果で進むように差し替え
  const handleNext = () => {
    setStepIndex((i) => Math.min(i + 1, lesson.steps.length - 1));
  };

  // Step 5 までの繋ぎ: 入力・プレビューはプレースホルダで置いておく
  const centerPlaceholder = (
    <div className="h-full grid place-items-center text-slate-600 text-sm">
      コードエディタ(Step 5 で実装)
    </div>
  );
  const rightTopPlaceholder = (
    <div className="h-full grid place-items-center text-slate-600 text-sm bg-slate-900/50">
      プレビュー(Step 4 で実装)
    </div>
  );

  // Reference `code`/`setCode` so the variables stay useful for later steps
  // and TypeScript doesn't flag them as unused.
  void code;
  void setCode;

  return (
    <ThreePaneLayout
      left={
        <LessonPanel
          lesson={lesson}
          currentStepIndex={stepIndex}
          onNext={handleNext}
        />
      }
      center={centerPlaceholder}
      rightTop={rightTopPlaceholder}
      rightBottom={<ChatPanel />}
    />
  );
}
