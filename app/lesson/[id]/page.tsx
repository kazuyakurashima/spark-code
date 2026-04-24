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
  // Pass only the lesson id across the RSC boundary; the client component
  // re-hydrates the full lesson object (which contains non-serializable
  // match functions) by re-importing lessons.ts.
  return <LessonWorkspace lessonId={lesson.id} />;
}
