import type { NextRequest } from "next/server";
import { matchStep } from "@/lib/lessons-server";
import { callHaikuText } from "@/lib/anthropic";
import { getSupabaseServer } from "@/lib/supabase-server";
import { isAllowedOrigin } from "@/lib/origin-check";
import {
  DIAGNOSE_ALREADY_PASSING_MESSAGE,
  JUDGE_FAIL_MESSAGE_DEFAULT,
  SUMMARY_TOO_EARLY_MESSAGE,
  buildDiagnosePrompt,
  buildExplainPrompt,
  buildHintPrompt,
  buildImprovePrompt,
  buildJudgePrompt,
  buildPraisePrompt,
  buildQuestionPrompt,
  buildSummaryPrompt,
} from "@/lib/prompts";
import type { ChatRequest, ChatResponse } from "@/types/chat";
import type { LearningEventType } from "@/types/supabase";

// Anthropic SDK uses Node APIs, so keep this on the Node runtime.
export const runtime = "nodejs";

// Server-side payload caps. Must match the values the client surface
// enforces — the textarea caps `question` at 500, so the server caps at 500
// too. Anything tighter than the client UI lets through is a footgun;
// anything looser silently allows direct-POST bypass.
const MAX_CODE_LENGTH = 10_000;
const MAX_QUESTION_LENGTH = 500;
const MAX_STEP_ID_LENGTH = 32;
const MAX_SESSION_ID_LENGTH = 64;

/** Lightweight runtime guard so a malformed body produces a typed 400. */
function isValidRequest(body: unknown): body is ChatRequest {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (typeof b.stepId !== "string") return false;
  switch (b.type) {
    case "judge":
    case "hint":
    case "praise":
    case "explain":
    case "improve":
    case "diagnose":
      return typeof b.code === "string";
    case "question":
      return typeof b.code === "string" && typeof b.question === "string";
    case "summary":
      return typeof b.sessionId === "string";
    default:
      return false;
  }
}

/** Returns an error message if any size cap is exceeded, else null. */
function checkSizeLimits(body: ChatRequest): string | null {
  if (body.stepId.length > MAX_STEP_ID_LENGTH) {
    return "stepId が長すぎます";
  }
  if ("code" in body && body.code.length > MAX_CODE_LENGTH) {
    return `コードが長すぎます(${MAX_CODE_LENGTH} 文字以内)`;
  }
  if (body.type === "question" && body.question.length > MAX_QUESTION_LENGTH) {
    return `質問が長すぎます(${MAX_QUESTION_LENGTH} 文字以内)`;
  }
  if (
    body.type === "summary" &&
    body.sessionId.length > MAX_SESSION_ID_LENGTH
  ) {
    return "sessionId が長すぎます";
  }
  return null;
}

/** Best-effort JSON extraction — tolerate stray prose before/after the object. */
function extractJsonObject(text: string): unknown | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** Format learning_events rows for the summary prompt. */
function formatEventsForSummary(
  rows: Array<{
    event_type: string;
    lesson_id: string;
    step_id: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
  }>,
): string {
  return rows
    .map((row) => {
      const meta = JSON.stringify(row.metadata).slice(0, 120);
      return `- ${row.created_at} | ${row.event_type} | lesson=${row.lesson_id} step=${row.step_id ?? "-"} | ${meta}`;
    })
    .join("\n");
}

export async function POST(request: NextRequest) {
  // Same-origin check: defense in depth. The summary endpoint reads
  // learning_events keyed solely on the caller-supplied sessionId;
  // without authentication, the only privacy boundary is "you can't
  // hit this endpoint from outside our origin". See lib/origin-check.ts
  // for the trade-off note (shallow check, real hardening = Phase 3.2
  // auth + rate limiting).
  if (!isAllowedOrigin(request)) {
    return Response.json(
      { type: "error", message: "forbidden origin" } satisfies ChatResponse,
      { status: 403 },
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { type: "error", message: "JSON のパースに失敗しました" } satisfies ChatResponse,
      { status: 400 },
    );
  }
  if (!isValidRequest(body)) {
    return Response.json(
      { type: "error", message: "リクエスト形式が不正です" } satisfies ChatResponse,
      { status: 400 },
    );
  }
  const sizeError = checkSizeLimits(body);
  if (sizeError) {
    return Response.json(
      { type: "error", message: sizeError } satisfies ChatResponse,
      { status: 413 },
    );
  }

  try {
    switch (body.type) {
      case "judge": {
        // Source of truth: regex matcher.
        const passes = matchStep(body.stepId, body.code);
        if (!passes) {
          // Skip Claude on failure to save tokens and latency.
          return Response.json(
            {
              type: "judge",
              correct: false,
              message: JUDGE_FAIL_MESSAGE_DEFAULT,
            } satisfies ChatResponse,
          );
        }
        // Secondary: ask Claude for a tailored congrats line. Regex is still
        // authoritative — even if Claude fails or returns garbage, correct=true.
        try {
          const { system, user } = buildJudgePrompt(body);
          const text = await callHaikuText({
            system,
            user,
            temperature: 0.2,
            maxTokens: 200,
          });
          const parsed = extractJsonObject(text) as
            | { message?: unknown }
            | null;
          const message =
            parsed && typeof parsed.message === "string" && parsed.message.trim()
              ? parsed.message.trim()
              : "正解!よく書けたね。";
          return Response.json({
            type: "judge",
            correct: true,
            message,
          } satisfies ChatResponse);
        } catch (err) {
          console.warn("[chat] judge secondary call failed:", err);
          return Response.json({
            type: "judge",
            correct: true,
            message: "正解!よく書けたね。",
          } satisfies ChatResponse);
        }
      }
      case "hint": {
        const { system, user } = buildHintPrompt(body);
        const text = await callHaikuText({
          system,
          user,
          temperature: 0.7,
          maxTokens: 220,
        });
        return Response.json({
          type: "hint",
          message: text.trim() || "もう一度ステップの指示を読んでみよう。",
        } satisfies ChatResponse);
      }
      case "praise": {
        const { system, user } = buildPraisePrompt(body);
        const text = await callHaikuText({
          system,
          user,
          temperature: 0.8,
          maxTokens: 160,
        });
        return Response.json({
          type: "praise",
          message: text.trim() || "正解!その調子!",
        } satisfies ChatResponse);
      }
      case "question": {
        const { system, user } = buildQuestionPrompt(body);
        const text = await callHaikuText({
          system,
          user,
          temperature: 0.5,
          maxTokens: 320,
        });
        return Response.json({
          type: "question",
          message:
            text.trim() ||
            "ごめん、うまく答えが作れなかった。もう一度質問してみてくれる?",
        } satisfies ChatResponse);
      }
      case "explain": {
        const { system, user } = buildExplainPrompt(body);
        const text = await callHaikuText({
          system,
          user,
          temperature: 0.5,
          maxTokens: 320,
        });
        return Response.json({
          type: "explain",
          message:
            text.trim() ||
            "ごめん、うまく説明が作れなかった。もう一度押してみて。",
        } satisfies ChatResponse);
      }
      case "improve": {
        const { system, user } = buildImprovePrompt(body);
        const text = await callHaikuText({
          system,
          user,
          temperature: 0.7,
          maxTokens: 220,
        });
        return Response.json({
          type: "improve",
          message:
            text.trim() ||
            "今のコードよくできてるよ!次のレッスンでもっと良くしていこう。",
        } satisfies ChatResponse);
      }
      case "summary": {
        const supabase = getSupabaseServer();
        // Count completion events across the **entire** session (not just
        // the most recent 20) to decide whether the sparseness gate
        // fires. Doing this on .limit(20) would falsely re-trigger the
        // "too early" message for active learners whose older completion
        // events have rolled out of the window.
        // Two cheap HEAD count queries instead of fetching all rows.
        const lessonCountQ = await supabase
          .from("learning_events")
          .select("*", { count: "exact", head: true })
          .eq("session_id", body.sessionId)
          .eq("event_type", "lesson_completed");
        const stepCountQ = await supabase
          .from("learning_events")
          .select("*", { count: "exact", head: true })
          .eq("session_id", body.sessionId)
          .eq("event_type", "step_completed");
        if (lessonCountQ.error || stepCountQ.error) {
          console.warn(
            "[chat] summary count supabase failed:",
            lessonCountQ.error ?? stepCountQ.error,
          );
          return Response.json({
            type: "summary",
            message:
              "学習ログが取得できませんでした…少し待ってから試してください。",
          } satisfies ChatResponse);
        }
        const lessonCompletions = lessonCountQ.count ?? 0;
        const stepCompletions = stepCountQ.count ?? 0;
        if (lessonCompletions === 0 && stepCompletions < 3) {
          return Response.json({
            type: "summary",
            message: SUMMARY_TOO_EARLY_MESSAGE,
          } satisfies ChatResponse);
        }
        // Past the gate: fetch the most recent 40 events of the types
        // that actually feed the retrospective. Excluding `code_changed`
        // (high-volume but low-signal) and `step_started` keeps the
        // prompt window aligned with the gate — the data Claude sees
        // includes the same completion / hint / question events the
        // gate counted, even on long sessions.
        const SUMMARY_EVENT_TYPES: LearningEventType[] = [
          "lesson_started",
          "lesson_completed",
          "step_completed",
          "judge_executed",
          "hint_requested",
          "question_asked",
        ];
        const { data, error } = await supabase
          .from("learning_events")
          .select("event_type, lesson_id, step_id, metadata, created_at")
          .eq("session_id", body.sessionId)
          .in("event_type", SUMMARY_EVENT_TYPES)
          .order("created_at", { ascending: false })
          .limit(40);
        if (error) {
          console.warn("[chat] summary supabase failed:", error);
          return Response.json({
            type: "summary",
            message:
              "学習ログが取得できませんでした…少し待ってから試してください。",
          } satisfies ChatResponse);
        }
        const rows = (data ?? []) as Array<{
          event_type: string;
          lesson_id: string;
          step_id: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        }>;
        const recentEvents = formatEventsForSummary(rows);
        const { system, user } = buildSummaryPrompt({
          stepId: body.stepId,
          recentEvents,
        });
        const text = await callHaikuText({
          system,
          user,
          temperature: 0.6,
          maxTokens: 360,
        });
        return Response.json({
          type: "summary",
          message: text.trim() || SUMMARY_TOO_EARLY_MESSAGE,
        } satisfies ChatResponse);
      }
      case "diagnose": {
        // Diagnose intentionally does NOT advance the step. If the regex
        // already passes, surface a canned message that points at the
        // judge button so the learner stays in control of progression.
        const passes = matchStep(body.stepId, body.code);
        if (passes) {
          return Response.json({
            type: "diagnose",
            message: DIAGNOSE_ALREADY_PASSING_MESSAGE,
          } satisfies ChatResponse);
        }
        const { system, user } = buildDiagnosePrompt(body);
        const text = await callHaikuText({
          system,
          user,
          temperature: 0.4,
          maxTokens: 240,
        });
        return Response.json({
          type: "diagnose",
          message:
            text.trim() ||
            "うーん、うまく差分を指摘できなかった。指示文をもう一度読み直してみて。",
        } satisfies ChatResponse);
      }
    }
  } catch (err) {
    console.warn("[chat] route error:", err);
    return Response.json(
      {
        type: "error",
        message:
          "AI への問い合わせに失敗しました。少し待ってから再度試してください。",
      } satisfies ChatResponse,
      { status: 500 },
    );
  }
}
