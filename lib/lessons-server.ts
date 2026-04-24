// Server-only judge logic. Keeps the regex matchers and reference
// solutions out of the client bundle so answer keys never leave the
// server. Importing this module from a Client Component will fail
// at build time.
import "server-only";

const stepMatchers: Record<string, (code: string) => boolean> = {
  // Lesson 1
  "1-1": (code) => /<h1>\s*名前\s*<\/h1>/.test(code),
  "1-2": (code) => {
    const m = code.match(/<h1>([\s\S]*?)<\/h1>/);
    if (!m) return false;
    const inner = m[1].trim();
    return inner.length > 0 && inner !== "名前";
  },
  "1-3": () => true,
};

const stepSolutions: Record<string, string | null> = {
  "1-1": "<h1>名前</h1>",
  "1-2": "<h1>太郎</h1>",
  "1-3": null,
};

/**
 * Run the regex-based source-of-truth matcher for a given step.
 * Returns false if the step has no registered matcher.
 */
export function matchStep(stepId: string, code: string): boolean {
  const fn = stepMatchers[stepId];
  return fn ? fn(code) : false;
}

/**
 * Reference solution string for a step (or null if not applicable).
 * Used by the judge prompt builder on the server.
 */
export function getSolution(stepId: string): string | null {
  return stepSolutions[stepId] ?? null;
}
