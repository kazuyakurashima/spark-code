import { notFound } from "next/navigation";
import { getLesson } from "@/lib/lessons";
import { LessonWorkspace } from "@/components/LessonWorkspace";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  // `key` forces React to remount on lesson change so the workspace's
  // `code` / `stepIndex` state can't leak across lessons.
  return <LessonWorkspace key={lesson.id} lessonId={lesson.id} />;
}
