"use client";

import { useState } from "react";
import { getLesson } from "@/lib/lessons";
import { ThreePaneLayout } from "./ThreePaneLayout";
import { LessonPanel } from "./LessonPanel";
import { ChatPanel } from "./ChatPanel";
import { Preview } from "./Preview";
import { CodeEditor } from "./CodeEditor";

export function LessonWorkspace({ lessonId }: { lessonId: number }) {
  const lesson = getLesson(lessonId);
  if (!lesson) {
    // Server already validated; this branch is defensive and should not fire.
    throw new Error(`Lesson ${lessonId} not found`);
  }
  const [code, setCode] = useState("");
  const [stepIndex, setStepIndex] = useState(0);

  // TODO: 第2段階で AI judge の結果で進むように差し替え
  const handleNext = () => {
    setStepIndex((i) => Math.min(i + 1, lesson.steps.length - 1));
  };

  return (
    <ThreePaneLayout
      left={
        <LessonPanel
          lesson={lesson}
          currentStepIndex={stepIndex}
          onNext={handleNext}
        />
      }
      center={<CodeEditor value={code} onChange={setCode} />}
      rightTop={<Preview code={code} previewCss={lesson.previewCss} />}
      rightBottom={<ChatPanel />}
    />
  );
}
