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

export type ChatRequest =
  | ChatRequestJudge
  | ChatRequestHint
  | ChatRequestPraise
  | ChatRequestQuestion;

export type ChatResponseJudge = {
  type: "judge";
  correct: boolean;
  message: string;
};

export type ChatResponseTextual = {
  type: "hint" | "praise" | "question";
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

// In-memory chat history entry for the UI. Not part of the API wire format.
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  kind: "judge" | "hint" | "praise" | "question" | "error";
  /** Only set for kind === "judge". */
  correct?: boolean;
};
