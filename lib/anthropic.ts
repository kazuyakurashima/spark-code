import "server-only";

import Anthropic from "@anthropic-ai/sdk";

// Model alias — automatically resolves to the latest Haiku 4.5 snapshot.
// Verified against docs.anthropic.com on 2026-04-25.
export const HAIKU_MODEL = "claude-haiku-4-5";

let cachedClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Copy .env.local.example to .env.local and fill in the key.",
    );
  }
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

type CallOptions = {
  system: string;
  user: string;
  maxTokens?: number;
  /** 0–1. Lower = more deterministic (use ~0.2 for JSON outputs). */
  temperature?: number;
};

/**
 * Single-shot text completion against Haiku 4.5. Concatenates all returned
 * text blocks; throws if the request errors out.
 */
export async function callHaikuText({
  system,
  user,
  maxTokens = 256,
  temperature = 0.6,
}: CallOptions): Promise<string> {
  const client = getClient();
  const resp = await client.messages.create({
    model: HAIKU_MODEL,
    max_tokens: maxTokens,
    temperature,
    system,
    messages: [{ role: "user", content: user }],
  });
  return resp.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");
}
