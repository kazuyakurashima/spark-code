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
  return <LessonWorkspace lesson={lesson} />;
}
