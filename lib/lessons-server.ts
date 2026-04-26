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
  // Lesson 2: <p> タグが存在し、中身が trim 後 0 文字超
  "2-1": (code) => {
    const m = code.match(/<p>([\s\S]*?)<\/p>/);
    if (!m) return false;
    return m[1].trim().length > 0;
  },
  "2-2": () => true,
  // Lesson 3: <ul> 内に <li> が 2 つ以上、各 <li> が trim 後非空
  "3-1": (code) => {
    const ul = code.match(/<ul[^>]*>([\s\S]*?)<\/ul>/);
    if (!ul) return false;
    const items = Array.from(
      ul[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g),
    );
    if (items.length < 2) return false;
    return items.every((m) => m[1].trim().length > 0);
  },
  "3-2": () => true,
  // Lesson 4: <style> 内に「`color:` プロパティが、黒以外の値で設定されている」
  // - background-color / border-color などの *-color とは区別する
  // - 複数の color: 宣言があれば、どれか 1 つでも非黒なら合格
  "4-1": (code) => {
    const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    if (!styleMatch) return false;
    const css = styleMatch[1];
    const colorDecls = Array.from(
      // (?:^|[^-]) で `background-color` 等を除外
      css.matchAll(/(?:^|[^-])color\s*:\s*([^;}]+)/gi),
    );
    if (colorDecls.length === 0) return false;
    const blackValues = new Set([
      "black",
      "#000",
      "#000000",
      "rgb(0,0,0)",
      "rgba(0,0,0,1)",
      "rgb(0%,0%,0%)",
      "hsl(0,0%,0%)",
    ]);
    return colorDecls.some((m) => {
      const v = m[1].trim().toLowerCase().replace(/\s+/g, "");
      return v.length > 0 && !blackValues.has(v);
    });
  },
  "4-2": () => true,
};

const stepSolutions: Record<string, string | null> = {
  "1-1": "<h1>名前</h1>",
  "1-2": "<h1>太郎</h1>",
  "1-3": null,
  "2-1": "<h1>かず</h1>\n<p>水戸の塾で先生をしています</p>",
  "2-2": null,
  "3-1":
    "<h1>かず</h1>\n<p>水戸の塾で先生をしています</p>\n<ul>\n  <li>司馬遼太郎</li>\n  <li>歴史</li>\n  <li>ジャズ</li>\n</ul>",
  "3-2": null,
  "4-1":
    "<style>\n  h1 { color: pink; }\n</style>\n<h1>かず</h1>\n<p>水戸の塾で先生をしています</p>",
  "4-2": null,
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
