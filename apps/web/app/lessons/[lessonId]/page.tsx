import { notFound } from "next/navigation";
import { LessonReader } from "../../../components/LessonReader";
import { isPublishedLessonId } from "../../../lib/publishedLessons";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  if (!isPublishedLessonId(lessonId)) notFound();
  return <LessonReader lessonId={lessonId} />;
}
