import { NextResponse } from "next/server";

const API_ORIGIN = process.env.ATHENA_API_ORIGIN ?? "http://api:8000";
const PROGRESS_PATH = "/v1/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(`${API_ORIGIN}${PROGRESS_PATH}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { detail: "Der interne Lernstandsdienst ist nicht erreichbar." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
