import type { NextRequest } from "next/server";
import { matchStep } from "@/lib/lessons-server";
import { callHaikuText } from "@/lib/anthropic";
import {
  JUDGE_FAIL_MESSAGE_DEFAULT,
  buildHintPrompt,
  buildJudgePrompt,
  buildPraisePrompt,
  buildQuestionPrompt,
} from "@/lib/prompts";
import type { ChatRequest, ChatResponse } from "@/types/chat";

// Anthropic SDK uses Node APIs, so keep this on the Node runtime.
export const runtime = "nodejs";

// Server-side payload caps. Must match the values the client surface
// enforces — the textarea caps `question` at 500, so the server caps at 500
// too. Anything tighter than the client UI lets through is a footgun;
// anything looser silently allows direct-POST bypass.
const MAX_CODE_LENGTH = 10_000;
const MAX_QUESTION_LENGTH = 500;
const MAX_STEP_ID_LENGTH = 32;

/** Lightweight runtime guard so a malformed body produces a typed 400. */
function isValidRequest(body: unknown): body is ChatRequest {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (typeof b.stepId !== "string" || typeof b.code !== "string") return false;
  switch (b.type) {
    case "judge":
    case "hint":
    case "praise":
      return true;
    case "question":
      return typeof b.question === "string";
    default:
      return false;
  }
}

/** Returns an error message if any size cap is exceeded, else null. */
function checkSizeLimits(body: ChatRequest): string | null {
  if (body.stepId.length > MAX_STEP_ID_LENGTH) {
    return "stepId が長すぎます";
  }
  if (body.code.length > MAX_CODE_LENGTH) {
    return `コードが長すぎます(${MAX_CODE_LENGTH} 文字以内)`;
  }
  if (body.type === "question" && body.question.length > MAX_QUESTION_LENGTH) {
    return `質問が長すぎます(${MAX_QUESTION_LENGTH} 文字以内)`;
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

export async function POST(request: NextRequest) {
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
