// Client-safe lesson data. Answer keys and match logic live in
// lib/lessons-server.ts ("server-only") so they never ship to the browser.

export type LessonStep = {
  id: string;
  title: string;
  instruction: string;
  hintDefault: string;
};

/** §4 / §5: 1 周目=全体像, 2 周目=整える, 3 周目=動かす. */
export type LessonRound = 1 | 2 | 3;

/**
 * §6 Lesson 4 / Lesson 5 / §10.3:
 * - "html" : 学習者は HTML のみ。`<style>`/`<script>` は受け付けるが扱わない
 * - "html+css" : `<style>` を含む HTML を許容(Lesson 4)
 * - "html+css+js" : iframe で `<script>` を実行(sandbox=allow-scripts)
 */
export type LessonPreviewMode = "html" | "html+css" | "html+css+js";

/** どの言語で CodeMirror を立ち上げるか。デフォルトは "html"。 */
export type LessonEditorLanguage = "html" | "javascript";

/**
 * プレビュー iframe に学習者コードと一緒に注入される、教材側の「お膳立て」。
 * §16.2 の通り、Lesson 5 の `document.querySelector` 等はここに置き、
 * 学習者には書かせない。
 */
export type LessonScaffold = {
  /** 学習者コードの **前** に <body> 内へ差し込む HTML。 */
  beforeHtml?: string;
  /** 学習者コードの **後** に <body> 内へ差し込む HTML。 */
  afterHtml?: string;
  /**
   * `<script>` ブロックの先頭に挿入する JS。previewMode が
   * "html+css+js" のときのみ実行される。学習者の JS はこの後に走る。
   */
  js?: string;
};

export type Lesson = {
  id: number;
  /** §4 / §5.1 */
  round: LessonRound;
  /** §5.3: false=無料(Lesson 1-6), true=SparkPlus(Lesson 7+) */
  paid: boolean;
  title: string;
  overview: string;
  /** §3.1: 1 レッスン 1 新概念。Sparkコーチの explain で使う。 */
  concept: string;
  /** §10.3 / §16.2 */
  previewMode: LessonPreviewMode;
  /** デフォルト "html"。Lesson 5 などで "javascript"。 */
  editorLanguage?: LessonEditorLanguage;
  /** §10.3: 各レッスンに事前に当てるレッスンレベルのプリセット CSS。 */
  previewCss: string;
  /** §16.2: 学習者には見えない、レッスンが用意するお膳立てコード。 */
  scaffold?: LessonScaffold;
  /** レッスンを開いたときにエディタへ初期表示する内容。空ならエディタも空。 */
  starterCode?: string;
  steps: LessonStep[];
};

// Shared canvas styling. Each lesson extends this so the learner sees
// their card visibly evolve as new elements join the page.
const BASE_PREVIEW_CSS = `
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 55%, #ec4899 100%);
  font-family: "Inter", "Noto Sans JP", system-ui, -apple-system, sans-serif;
  color: #ffffff;
  text-align: center;
  padding: 2rem;
  box-sizing: border-box;
}
`;

// Lesson 1: bold centered name only.
const LESSON_1_PREVIEW_CSS = (BASE_PREVIEW_CSS + `
h1 {
  font-size: clamp(2.5rem, 9vw, 6rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  text-shadow: 0 8px 40px rgba(0, 0, 0, 0.25);
}
`).trim();

// Lesson 2: name shrinks slightly to make room for an introduction
// paragraph. The new <p> rule is what produces this lesson's visible change.
const LESSON_2_PREVIEW_CSS = (BASE_PREVIEW_CSS + `
h1 {
  font-size: clamp(2rem, 7vw, 4.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 1rem;
  text-shadow: 0 8px 40px rgba(0, 0, 0, 0.25);
}
p {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.92);
  max-width: 36ch;
  margin: 0 auto;
}
`).trim();

export const lessons: Lesson[] = [
  {
    id: 1,
    round: 1,
    paid: false,
    title: "名前を画面に表示しよう",
    overview:
      "HTML の `<h1>` タグを使って、画面に自分の名前を表示します。これだけで、こんなに綺麗な画面が作れるよ。",
    concept: "<h1> タグで見出しを表示する",
    previewMode: "html",
    previewCss: LESSON_1_PREVIEW_CSS,
    steps: [
      {
        id: "1-1",
        title: "タグの基本形を書こう",
        instruction:
          "まずはタグの形に慣れよう。\n\nエディタに `<h1>名前</h1>` と書いてみて。\n\n`<h1>` が開始タグ、`</h1>` が終了タグ。その間に挟んだ文字(`名前`)が画面に表示されるよ。",
        hintDefault:
          "`<h1>` → `名前` → `</h1>` の順番で書くよ。間違えやすいのは `/` の向き。",
      },
      {
        id: "1-2",
        title: "自分の名前に変えよう",
        instruction:
          "`名前` の部分を、あなた自身の名前に変えてみて。\n\n書き換えると、右のプレビューがリアルタイムで変わるのが見えるはず。コードと画面の関係を目で確かめてね。",
        hintDefault:
          "`<h1>` と `</h1>` に挟まれた部分を、自分の名前に書き換えるだけで OK。",
      },
      {
        id: "1-3",
        title: "完成!",
        instruction:
          "おめでとう!Lesson 1 クリアだ 🎉\n\n`<h1>` タグだけで、画面いっぱいの綺麗なデザインが作れたね。\n\n次は **自己紹介文** を追加して、もっとあなたらしいページにしよう。",
        hintDefault: "",
      },
    ],
  },
  {
    id: 2,
    round: 1,
    paid: false,
    title: "自己紹介文を表示しよう",
    overview:
      "名前の下に、自己紹介の文章を 1 行追加します。`<p>` タグで囲むと、ページに「文章のかたまり」を載せられるよ。",
    concept: "<p> タグで段落の文章を表示する",
    previewMode: "html",
    previewCss: LESSON_2_PREVIEW_CSS,
    starterCode: "<h1>かず</h1>\n",
    steps: [
      {
        id: "2-1",
        title: "自己紹介を 1 行書こう",
        instruction:
          "Lesson 1 で書いた名前の下に、自分の自己紹介を 1 行追加してみよう。\n\n例: `<p>水戸の塾で先生をしています</p>` と書くと「水戸の塾で先生をしています」が表示されるよ。\n\n`<p>` は文章のかたまりを囲むタグ(段落を表す paragraph タグ)。",
        hintDefault:
          "`<h1>...</h1>` の下に新しい行で `<p>...</p>` を書いてみて。中身は何でも OK。",
      },
      {
        id: "2-2",
        title: "完成!",
        instruction:
          "Lesson 2 クリア!🎉\n\n名前 + 自己紹介で、ぐっと「自分のページ感」が出てきたね。\n\n次は **好きなものリスト** を加えて、もっと自分らしくしよう。",
        hintDefault: "",
      },
    ],
  },
];

export function getLesson(id: number | string): Lesson | undefined {
  const numId = typeof id === "string" ? Number(id) : id;
  if (!Number.isFinite(numId)) return undefined;
  return lessons[numId - 1];
}

/** Look up a step by its `lesson-step` id (e.g. "1-2"). */
export function getStep(
  stepId: string,
): { lesson: Lesson; step: LessonStep } | undefined {
  for (const lesson of lessons) {
    const step = lesson.steps.find((s) => s.id === stepId);
    if (step) return { lesson, step };
  }
  return undefined;
}
