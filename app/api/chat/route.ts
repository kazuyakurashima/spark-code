import type { NextRequest } from "next/server";
import { matchStep } from "@/lib/lessons-server";
import type { ChatRequest, ChatResponse } from "@/types/chat";

// Anthropic SDK uses Node APIs, so keep this on the Node runtime.
export const runtime = "nodejs";

/**
 * Step 7: stub responses for all four chat types.
 * Real Claude calls land in Step 8.
 *
 * `judge` already uses the source-of-truth regex from lessons-server so the
 * client wiring is testable end to end without burning tokens.
 */
export async function POST(request: NextRequest) {
  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return Response.json(
      { type: "error", message: "JSON のパースに失敗しました" } satisfies ChatResponse,
      { status: 400 },
    );
  }

  switch (body.type) {
    case "judge": {
      const passes = matchStep(body.stepId, body.code);
      return Response.json(
        {
          type: "judge",
          correct: passes,
          message: passes
            ? "正解!よく書けたね。(stub)"
            : "おしい!もう一度コードを見直してみて。(stub)",
        } satisfies ChatResponse,
      );
    }
    case "hint":
      return Response.json(
        {
          type: "hint",
          message: "ヒント:タグの形 `<h1>中身</h1>` を確認してみて。(stub)",
        } satisfies ChatResponse,
      );
    case "praise":
      return Response.json(
        {
          type: "praise",
          message: "完璧!次のステップへ進もう!(stub)",
        } satisfies ChatResponse,
      );
    case "question":
      return Response.json(
        {
          type: "question",
          message: `「${body.question}」への詳しい回答は Step 8 で実装されます。(stub)`,
        } satisfies ChatResponse,
      );
    default:
      return Response.json(
        { type: "error", message: "不正な type" } satisfies ChatResponse,
        { status: 400 },
      );
  }
}
