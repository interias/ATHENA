import { NextResponse } from "next/server";

const API_ORIGIN = process.env.ATHENA_API_ORIGIN ?? "http://api:8000";
const CURRICULUM_PATH = "/v1/curriculum";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(`${API_ORIGIN}${CURRICULUM_PATH}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });

    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json(
      { detail: "Der interne Curriculum-Dienst ist nicht erreichbar." },
      { status: 503 },
    );
  }
}
