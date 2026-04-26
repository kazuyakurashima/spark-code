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
  /**
   * Returns true iff the CSS selector targets `<h1>` as a real type
   * selector (not as a class `.h1`, an id `#h1`, or inside a functional
   * pseudo like `:not(h1)`).
   *
   * Strategy: split the selector by descendant/child/adjacent/sibling
   * combinators, then for each compound selector look at the LEADING
   * identifier (before any `.` `#` `:` `[`). That identifier is the
   * type selector; we accept the rule if any token starts with `h1`
   * exactly.
   */
  // (helper hoisted out of the matcher closure for readability)
};

function selectorTargetsH1(selector: string): boolean {
  const tokens = selector
    .split(/[\s>+~]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  return tokens.some((token) => {
    const m = token.match(/^([a-zA-Z][a-zA-Z0-9-]*)/);
    return m !== null && m[1].toLowerCase() === "h1";
  });
}

// Lesson 4: <style> の中で「<h1> を直接ターゲットにするルール」が
// `color:` を黒以外の値で設定していること。
// - background-color / border-color などの *-color プロパティは除外
// - .h1 / #h1 / :not(h1) など h1 を別文脈で含むだけのセレクタは不合格
// - p { color: ... } や body { color: ... } では合格させない
stepMatchers["4-1"] = (code) => {
  const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  if (!styleMatch) return false;
  const css = styleMatch[1];
  const blackValues = new Set([
    "black",
    "#000",
    "#000000",
    "rgb(0,0,0)",
    "rgba(0,0,0,1)",
    "rgb(0%,0%,0%)",
    "hsl(0,0%,0%)",
  ]);
  for (const rule of css.matchAll(/([^{}]+)\{([^}]+)\}/g)) {
    const selectors = rule[1].split(",");
    const targetsH1 = selectors.some(selectorTargetsH1);
    if (!targetsH1) continue;
    const decls = rule[2];
    for (const decl of decls.matchAll(/(?:^|[^-])color\s*:\s*([^;}]+)/gi)) {
      const v = decl[1].trim().toLowerCase().replace(/\s+/g, "");
      if (v.length > 0 && !blackValues.has(v)) return true;
    }
  }
  return false;
};

stepMatchers["4-2"] = () => true;

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
