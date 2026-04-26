"use client";

import type { Lesson } from "@/lib/lessons";

type Props = {
  /** Learner's editor content. Either HTML, HTML+CSS, or JS depending on
   *  `lesson.editorLanguage`. */
  code: string;
  /** Full lesson object — controls previewMode, editorLanguage, scaffold,
   *  and previewCss. T1 added these fields; T2 (this file) consumes them. */
  lesson: Lesson;
};

const SCAFFOLD_BEGIN = "<!-- scaffold-begin -->";
const SCAFFOLD_END = "<!-- scaffold-end -->";
const LEARNER_BEGIN = "<!-- learner-code-begin -->";
const LEARNER_END = "<!-- learner-code-end -->";

/**
 * Build the iframe srcDoc from the lesson + learner code.
 *
 * Layout (in order, inside <body>):
 *   {scaffold.beforeHtml}   → preset HTML the lesson designer provides
 *   {learner code}          → only when editorLanguage !== "javascript"
 *   {scaffold.afterHtml}    → preset HTML the lesson designer provides
 *   <script>{scaffold.js + learner code (when JS)}</script>
 *                           → only when previewMode === "html+css+js"
 *
 * The learner's code goes inside HTML comments so a future debug pane
 * can pretty-print which lines came from where.
 */
function buildSrcDoc(code: string, lesson: Lesson): string {
  const beforeHtml = lesson.scaffold?.beforeHtml ?? "";
  const afterHtml = lesson.scaffold?.afterHtml ?? "";
  const scaffoldJs = lesson.scaffold?.js ?? "";
  const isJsLesson =
    lesson.previewMode === "html+css+js" &&
    lesson.editorLanguage === "javascript";

  // HTML body: scaffold wraps the learner code unless the editor is
  // JavaScript-only (in which case the learner code lands in <script>).
  const bodyHtmlParts: string[] = [];
  if (beforeHtml) {
    bodyHtmlParts.push(SCAFFOLD_BEGIN, beforeHtml, SCAFFOLD_END);
  }
  if (!isJsLesson) {
    bodyHtmlParts.push(LEARNER_BEGIN, code, LEARNER_END);
  }
  if (afterHtml) {
    bodyHtmlParts.push(SCAFFOLD_BEGIN, afterHtml, SCAFFOLD_END);
  }

  // <script> block: only emitted in JS-enabled lessons. Combines the
  // hidden scaffold JS (e.g. document.querySelector) with the learner's
  // 1-line JS, if applicable.
  let scriptBlock = "";
  if (lesson.previewMode === "html+css+js") {
    const scriptParts: string[] = [];
    if (scaffoldJs.trim()) scriptParts.push(scaffoldJs.trim());
    if (isJsLesson && code.trim()) scriptParts.push(code.trim());
    if (scriptParts.length > 0) {
      scriptBlock = `<script>\n${scriptParts.join("\n\n")}\n</script>`;
    }
  }

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>preview</title>
<style>${lesson.previewCss}</style>
</head>
<body>
${bodyHtmlParts.join("\n")}
${scriptBlock}
</body>
</html>`;
}

/**
 * sandbox attribute is **always set** but the value depends on the lesson:
 *
 * - "html" / "html+css"  → `sandbox=""` (strictest: no scripts, no
 *   same-origin, no forms). The learner's code can include literal
 *   `<script>` tags but they will not execute.
 * - "html+css+js"        → `sandbox="allow-scripts"` (still cross-origin
 *   isolated, but scripts run so the lesson scaffold + learner JS work).
 */
function sandboxFor(lesson: Lesson): string {
  return lesson.previewMode === "html+css+js" ? "allow-scripts" : "";
}

export function Preview({ code, lesson }: Props) {
  const srcDoc = buildSrcDoc(code, lesson);
  return (
    <iframe
      srcDoc={srcDoc}
      sandbox={sandboxFor(lesson)}
      title="preview"
      className="w-full h-full border-0 bg-white block"
    />
  );
}
