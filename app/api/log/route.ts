import type { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import type { LearningEventType } from "@/types/supabase";

// supabase-js uses Node APIs, so keep this on the Node runtime.
export const runtime = "nodejs";

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
    const supabase = getSupabaseServer();
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
