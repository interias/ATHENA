import { NextRequest, NextResponse } from "next/server";
import { isPublishedLessonId } from "../../../../lib/publishedLessons";

const API_ORIGIN = process.env.ATHENA_API_ORIGIN ?? "http://api:8000";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await context.params;
  if (!isPublishedLessonId(lessonId)) {
    return NextResponse.json({ detail: "Lektion nicht gefunden." }, { status: 404 });
  }

  try {
    const response = await fetch(`${API_ORIGIN}/v1/lessons/${lessonId}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { detail: "Der interne Lektionsdienst ist nicht erreichbar." },
      { status: 503 },
    );
  }
}
