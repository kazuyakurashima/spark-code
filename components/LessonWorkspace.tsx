"use client";

import { useState } from "react";
import type { Lesson } from "@/lib/lessons";
import { ThreePaneLayout } from "./ThreePaneLayout";
import { LessonPanel } from "./LessonPanel";
import { ChatPanel } from "./ChatPanel";
import { Preview } from "./Preview";

export function LessonWorkspace({ lesson }: { lesson: Lesson }) {
  const [code, setCode] = useState("");
  const [stepIndex, setStepIndex] = useState(0);

  // TODO: 第2段階で AI judge の結果で進むように差し替え
  const handleNext = () => {
    setStepIndex((i) => Math.min(i + 1, lesson.steps.length - 1));
  };

  // Step 5 までの繋ぎ: コードエディタはプレースホルダ
  const centerPlaceholder = (
    <div className="h-full grid place-items-center text-slate-600 text-sm">
      コードエディタ(Step 5 で実装)
    </div>
  );

  // `setCode` は Step 5 の CodeEditor から書き込まれる
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
      rightTop={<Preview code={code} previewCss={lesson.previewCss} />}
      rightBottom={<ChatPanel />}
    />
  );
}
