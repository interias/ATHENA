import { NextRequest, NextResponse } from "next/server";

const API_ORIGIN = process.env.ATHENA_API_ORIGIN ?? "http://api:8000";
const PILOT_FEEDBACK_PATH = "/v1/pilot-feedback";
const ALLOWED_HOSTS = new Set(["127.0.0.1:3000", "localhost:3000"]);
const MAX_REQUEST_BYTES = 16_384;

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase();
  const origin = request.headers.get("origin");
  if (!host || !ALLOWED_HOSTS.has(host) || origin !== `http://${host}`) {
    return NextResponse.json({ detail: "Nicht erlaubte Anfragequelle." }, { status: 403 });
  }

  const contentType = request.headers.get("content-type")?.toLowerCase();
  if (!contentType || !/^application\/json(?:\s*;|$)/.test(contentType)) {
    return NextResponse.json({ detail: "Content-Type application/json erforderlich." }, { status: 415 });
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ detail: "Anfrage ist zu groß." }, { status: 413 });
  }

  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ detail: "Anfrage ist zu groß." }, { status: 413 });
    }
    const response = await fetch(`${API_ORIGIN}${PILOT_FEEDBACK_PATH}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body,
      signal: AbortSignal.timeout(5_000),
    });
    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { detail: "Der interne Feedbackdienst ist nicht erreichbar." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
