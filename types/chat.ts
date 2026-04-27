// Wire format for /api/chat.
// Request body is one of four `type` variants; the response is shape-dependent.

export type ChatRequestJudge = {
  type: "judge";
  stepId: string;
  code: string;
};

export type ChatRequestHint = {
  type: "hint";
  stepId: string;
  code: string;
};

export type ChatRequestPraise = {
  type: "praise";
  stepId: string;
  code: string;
};

export type ChatRequestQuestion = {
  type: "question";
  stepId: string;
  code: string;
  question: string;
};

/** §9.3「やさしく説明して」/ §9.7.1 — 主要概念をやさしく説明する */
export type ChatRequestExplain = {
  type: "explain";
  stepId: string;
  code: string;
};

/** §9.3「もっと良くしたい」/ §9.7.5 — 次レッスンの予告 */
export type ChatRequestImprove = {
  type: "improve";
  stepId: string;
  code: string;
};

/** §9.3「できたことを教えて」/ §9.7.3 — learning_events から 3 つ抽出 */
export type ChatRequestSummary = {
  type: "summary";
  stepId: string;
  /** localStorage の sparkcode.sessionId(report と同じ系統) */
  sessionId: string;
};

/** §9.3「どこが違う?」/ §9.7.2 不正解分岐 — 進行はしない */
export type ChatRequestDiagnose = {
  type: "diagnose";
  stepId: string;
  code: string;
};

export type ChatRequest =
  | ChatRequestJudge
  | ChatRequestHint
  | ChatRequestPraise
  | ChatRequestQuestion
  | ChatRequestExplain
  | ChatRequestImprove
  | ChatRequestSummary
  | ChatRequestDiagnose;

export type ChatResponseJudge = {
  type: "judge";
  correct: boolean;
  message: string;
};

export type ChatResponseTextual = {
  type:
    | "hint"
    | "praise"
    | "question"
    | "explain"
    | "improve"
    | "summary"
    | "diagnose";
  message: string;
};

export type ChatResponseError = {
  type: "error";
  message: string;
};

export type ChatResponse =
  | ChatResponseJudge
  | ChatResponseTextual
  | ChatResponseError;

/** §3.4 の 3 点セット payload。kind === "three-points" の Message が運ぶ。 */
export type ThreePointsPayload = {
  didLearn: string;
  cardEvolved: string;
  nextFun: string;
};

// In-memory chat history entry for the UI. Not part of the API wire format.
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  kind:
    | "judge"
    | "hint"
    | "praise"
    | "question"
    | "explain"
    | "improve"
    | "summary"
    | "diagnose"
    | "three-points"
    | "error";
  /** Only set for kind === "judge". */
  correct?: boolean;
  /** Only set for kind === "three-points". */
  threePoints?: ThreePointsPayload;
};
