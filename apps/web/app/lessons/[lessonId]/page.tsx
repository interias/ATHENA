import { notFound } from "next/navigation";
import { LessonReader } from "../../../components/LessonReader";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  if (lessonId !== "ch01-l01") notFound();
  return <LessonReader lessonId={lessonId} />;
}
