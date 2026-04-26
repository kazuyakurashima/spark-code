import type { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getLesson } from "@/lib/lessons";
import type {
  Lesson1Report,
  Lesson1ReportResponse,
  StepSummary,
} from "@/types/report";

// supabase-js needs Node.
export const runtime = "nodejs";

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

type LearningEventRow = {
  step_id: string | null;
  event_type: string;
  metadata: Record<string, unknown>;
};

function getMetadataBoolean(
  metadata: Record<string, unknown>,
  key: string,
): boolean | null {
  const v = metadata[key];
  return typeof v === "boolean" ? v : null;
}

function buildReport(
  sessionId: string,
  lessonId: string,
  rows: LearningEventRow[],
): Lesson1Report {
  const lesson = getLesson(lessonId);
  const totalSteps = lesson?.steps.length ?? 0;

  // Per-step accumulator keyed by step_id.
  type Acc = { attempts: number; passed: boolean };
  const perStep = new Map<string, Acc>();

  let questionsAsked = 0;
  let hintsUsed = 0;
  let completedSteps = 0;
  let lessonCompleted = false;

  for (const row of rows) {
    switch (row.event_type) {
      case "judge_executed": {
        if (!row.step_id) break;
        const acc = perStep.get(row.step_id) ?? { attempts: 0, passed: false };
        acc.attempts += 1;
        if (getMetadataBoolean(row.metadata, "correct") === true) {
          acc.passed = true;
        }
        perStep.set(row.step_id, acc);
        break;
      }
      case "step_completed": {
        completedSteps += 1;
        if (row.step_id) {
          const acc = perStep.get(row.step_id) ?? {
            attempts: 0,
            passed: true,
          };
          acc.passed = true;
          perStep.set(row.step_id, acc);
        }
        break;
      }
      case "hint_requested":
        hintsUsed += 1;
        break;
      case "question_asked":
        questionsAsked += 1;
        break;
      case "lesson_completed":
        lessonCompleted = true;
        break;
      default:
        // ignore lesson_started / step_started / code_changed in the report
        break;
    }
  }

  // Build per-step summary in lesson order so the UI can render it
  // without re-sorting.
  const steps: StepSummary[] = (lesson?.steps ?? []).map((step) => {
    const acc = perStep.get(step.id);
    return {
      stepId: step.id,
      title: step.title,
      attempts: acc?.attempts ?? 0,
      passed: acc?.passed ?? false,
    };
  });

  // Toughest = largest attempts among passed steps; ties → earlier in lesson.
  let toughest: Lesson1Report["toughestStep"] = null;
  for (const s of steps) {
    if (s.passed && s.attempts > 0) {
      if (!toughest || s.attempts > toughest.attempts) {
        toughest = { stepId: s.stepId, title: s.title, attempts: s.attempts };
      }
    }
  }

  // Smoothest = first step passed in exactly one attempt.
  let smoothest: Lesson1Report["smoothestStep"] = null;
  for (const s of steps) {
    if (s.passed && s.attempts === 1) {
      smoothest = { stepId: s.stepId, title: s.title };
      break;
    }
  }

  return {
    sessionId,
    lessonId,
    completedSteps,
    totalSteps,
    steps,
    toughestStep: toughest,
    smoothestStep: smoothest,
    questionsAsked,
    hintsUsed,
    lessonCompleted,
  };
}

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await ctx.params;
  if (!SESSION_ID_PATTERN.test(sessionId)) {
    return Response.json(
      { error: "invalid session id" } satisfies Lesson1ReportResponse,
      { status: 400 },
    );
  }
  // Lesson scope is fixed for the MVP; if other lessons appear later we'll
  // accept ?lessonId=... or scope on the URL.
  const lessonId = "1";

  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("learning_events")
      .select("step_id, event_type, metadata")
      .eq("session_id", sessionId)
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: true });
    if (error) {
      console.warn("[report] supabase select failed:", error);
      return Response.json(
        { error: "report query failed" } satisfies Lesson1ReportResponse,
        { status: 500 },
      );
    }
    const rows = (data ?? []) as LearningEventRow[];
    return Response.json(buildReport(sessionId, lessonId, rows));
  } catch (err) {
    console.warn("[report] route error:", err);
    return Response.json(
      { error: "internal" } satisfies Lesson1ReportResponse,
      { status: 500 },
    );
  }
}
