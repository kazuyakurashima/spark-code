import type { NextRequest } from "next/server";
import { getSupabaseAnonServer } from "@/lib/supabase-server";
import type { LearningEventType } from "@/types/supabase";

// supabase-js uses Node APIs, so keep this on the Node runtime.
export const runtime = "nodejs";

/**
 * Reject requests that don't come from our own origin. This is a
 * **shallow CSRF/drive-by check, not real auth** — anyone scripting a
 * client can forge a matching Origin header and pass. It blocks naive
 * curl/bot abuse and keeps casual third-party embeds from writing,
 * but not a determined attacker.
 *
 * Real hardening (rate limiting / HMAC-signed tokens / per-session
 * insert quota) is tracked as Phase 3 work; until then the route's
 * write power is also constrained by RLS via the anon client.
 */
function isAllowedOrigin(request: NextRequest): boolean {
  const host = request.headers.get("host");
  const origin = request.headers.get("origin");
  if (!host || !origin) return false;
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

const VALID_EVENT_TYPES: ReadonlySet<LearningEventType> = new Set<LearningEventType>([
  "lesson_started",
  "step_started",
  "step_completed",
  "judge_executed",
  "hint_requested",
  "question_asked",
  "code_changed",
  "lesson_completed",
]);

const MAX_SESSION_ID_LEN = 64;
const MAX_LESSON_ID_LEN = 16;
const MAX_STEP_ID_LEN = 32;
const MAX_METADATA_BYTES = 4_000;

type LogBody = {
  sessionId: string;
  lessonId: string;
  stepId: string | null;
  eventType: LearningEventType;
  metadata: Record<string, unknown>;
};

function isLogBody(value: unknown): value is LogBody {
  if (!value || typeof value !== "object") return false;
  const b = value as Record<string, unknown>;
  if (
    typeof b.sessionId !== "string" ||
    b.sessionId.length === 0 ||
    b.sessionId.length > MAX_SESSION_ID_LEN
  ) {
    return false;
  }
  if (
    typeof b.lessonId !== "string" ||
    b.lessonId.length === 0 ||
    b.lessonId.length > MAX_LESSON_ID_LEN
  ) {
    return false;
  }
  if (
    b.stepId !== null &&
    (typeof b.stepId !== "string" || b.stepId.length > MAX_STEP_ID_LEN)
  ) {
    return false;
  }
  if (
    typeof b.eventType !== "string" ||
    !VALID_EVENT_TYPES.has(b.eventType as LearningEventType)
  ) {
    return false;
  }
  if (typeof b.metadata !== "object" || b.metadata === null) return false;
  try {
    if (JSON.stringify(b.metadata).length > MAX_METADATA_BYTES) return false;
  } catch {
    return false; // circular reference etc.
  }
  return true;
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return Response.json({ error: "forbidden origin" }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }
  if (!isLogBody(body)) {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }
  try {
    // anon client: RLS becomes the real gate even for the route handler,
    // so this endpoint can't be coerced into doing more than an
    // anonymous client-side insert would.
    const supabase = getSupabaseAnonServer();
    const { error } = await supabase.from("learning_events").insert({
      session_id: body.sessionId,
      lesson_id: body.lessonId,
      step_id: body.stepId,
      event_type: body.eventType,
      metadata: body.metadata,
    });
    if (error) {
      console.warn("[log] insert failed:", error);
      return Response.json({ error: "insert failed" }, { status: 500 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.warn("[log] route error:", err);
    return Response.json({ error: "internal" }, { status: 500 });
  }
}
