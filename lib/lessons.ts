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
 * "lesson" = 通常の作問レッスン(エディタ + プレビュー + 3 ペイン)。
 * "recap"  = 振り返り画面のみ(コードを書かせない / §6 Lesson 6 / Lesson 16)。
 * デフォルトは "lesson"。
 */
export type LessonKind = "lesson" | "recap";

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
  /** デフォルト "lesson"。"recap" はコード入力なしの祭り画面。 */
  kind?: LessonKind;
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

// Lesson 5 stage: same vivid gradient as Lesson 1-3 so the learner's
// JS-driven text change feels like a "magic" transformation on the
// already familiar canvas. The default <h1> text shown via scaffold
// is "かず"; the learner's 1 line rewrites it to whatever they want.
const LESSON_5_PREVIEW_CSS = (BASE_PREVIEW_CSS + `
h1 {
  font-size: clamp(2.5rem, 9vw, 6rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  text-shadow: 0 8px 40px rgba(0, 0, 0, 0.25);
}
`).trim();

// Lesson 4 stage: a lighter card-like canvas so the learner's
// `color: ...` actually shows up dramatically. The default text colour
// is intentionally black/dark so the "before/after" contrast is huge.
const LESSON_4_PREVIEW_CSS = `
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f8fafc;
  color: #1f2937;
  font-family: "Inter", "Noto Sans JP", system-ui, -apple-system, sans-serif;
  text-align: center;
  padding: 2rem;
  box-sizing: border-box;
}
h1 {
  font-size: clamp(2rem, 7vw, 4.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 1rem;
  color: black;
}
p {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  line-height: 1.7;
  color: #4b5563;
  max-width: 36ch;
  margin: 0 auto 1.25rem;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  max-width: 24ch;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
li {
  font-size: clamp(0.95rem, 2.4vw, 1.1rem);
  line-height: 1.4;
  color: #4b5563;
}
`.trim();

// Lesson 3: adds list styling. Bullets removed for a cleaner card look,
// items spaced and the whole list constrained to a readable width.
const LESSON_3_PREVIEW_CSS = (BASE_PREVIEW_CSS + `
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
  margin: 0 auto 1.25rem;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  max-width: 24ch;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
li {
  font-size: clamp(0.95rem, 2.4vw, 1.1rem);
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.92);
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
  {
    id: 3,
    round: 1,
    paid: false,
    title: "好きなものリストを作ろう",
    overview:
      "あなたの好きなものを並べて、自分らしさをページに加えます。`<ul>` と `<li>` を使うと、項目を縦に並べた「リスト」が作れるよ。",
    concept: "<ul> と <li> で項目のリストを作る",
    previewMode: "html",
    previewCss: LESSON_3_PREVIEW_CSS,
    starterCode: "<h1>かず</h1>\n<p>水戸の塾で先生をしています</p>\n",
    steps: [
      {
        id: "3-1",
        title: "好きなものを 2 つ以上書こう",
        instruction:
          "自己紹介文の下に、好きなものを **2 つ以上** リストで並べてみよう。\n\n例:\n```html\n<ul>\n  <li>司馬遼太郎</li>\n  <li>歴史</li>\n  <li>ジャズ</li>\n</ul>\n```\n\n`<ul>` がリスト全体、`<li>` が 1 項目。`<li>` を増やせば項目も増えるよ。",
        hintDefault:
          "`<ul>` の中に `<li>項目</li>` を 2 行以上書くだけ。中身は何でも OK。",
      },
      {
        id: "3-2",
        title: "完成!",
        instruction:
          "Lesson 3 クリア!🎉\n\n名前・自己紹介・好きなものリストで、ページが立体的になってきたね。\n\n次は **色** を変えて、見た目に変化を加えよう。",
        hintDefault: "",
      },
    ],
  },
  {
    id: 4,
    round: 1,
    paid: false,
    title: "色を変えてみよう",
    overview:
      "ここまでは中身(HTML)を作ってきました。今度はそれを **どう見せるか**(CSS)を変えます。`<style>` タグの中に書いた CSS で、文字の色が一瞬で変わります。",
    concept: "<style> タグに CSS を書いて文字色を変える",
    previewMode: "html+css",
    previewCss: LESSON_4_PREVIEW_CSS,
    starterCode:
      "<style>\n\n</style>\n<h1>かず</h1>\n<p>水戸の塾で先生をしています</p>\n<ul>\n  <li>司馬遼太郎</li>\n  <li>歴史</li>\n  <li>ジャズ</li>\n</ul>\n",
    steps: [
      {
        id: "4-1",
        title: "見出しの色を変えよう",
        instruction:
          "`<style>` の中に **CSS のルール** を 1 つ書きます。下の例のように `h1` の色を、好きな色に変えてみよう。\n\n```css\nh1 { color: pink; }\n```\n\n色の名前は `pink` / `blue` / `red` / `green` などの英単語、または `#ff0066` のような色コードでも OK。**黒以外** ならどんな色でもクリアだよ。",
        hintDefault:
          "`<style>` と `</style>` の間の行に `h1 { color: pink; }` のように書いてみて。`h1` のあと、半角スペース、`{`、`color:`、好きな色、`;`、`}` の順番。",
      },
      {
        id: "4-2",
        title: "完成!",
        instruction:
          "Lesson 4 クリア!🎉\n\nCSS の力で、見た目が一瞬で変わったね。今書いた **`<style>`** が CSS の場所、**`color:`** が「文字の色」の指示。これだけで景色が変わる。\n\n次は **JavaScript** で、画面の文字を「あなたのコードで」書き換えてみよう。",
        hintDefault: "",
      },
    ],
  },
  {
    id: 5,
    round: 1,
    paid: false,
    title: "JavaScript で文字を変えよう",
    overview:
      "JavaScript は **画面の中身を変える** 言語です。たった 1 行のコードで、表示されている文字を一瞬で書き換えてみよう。",
    concept: "textContent で要素の文字を書き換える",
    previewMode: "html+css+js",
    editorLanguage: "javascript",
    previewCss: LESSON_5_PREVIEW_CSS,
    // 学習者には見せない「お膳立て」コード:
    // - <h1 id="name">かず</h1> を本体側に置いておく
    // - JS 側で document.querySelector("#name") を `name` にバインド
    // 学習者はこの `name` を使って textContent に代入する 1 行だけ書く。
    scaffold: {
      beforeHtml: '<h1 id="name">かず</h1>',
      js: 'const name = document.querySelector("#name");',
    },
    // 空。エディタは placeholder("ここに JavaScript を書いてみよう")で誘導。
    starterCode: "",
    steps: [
      {
        id: "5-1",
        title: "1 行で文字を書き換えよう",
        instruction:
          "JavaScript の世界へようこそ!\n\nエディタに、下の 1 行をそのまま書いてみよう:\n\n```js\nname.textContent = \"こんにちは!\";\n```\n\n意味:\n- `name` は **画面の `<h1>` を指している箱**(裏で用意されているよ)\n- `.textContent` は **「中身の文字」** を表す\n- `=` の右側の文字列が、画面の `<h1>` に書き込まれる\n\n`\"こんにちは!\"` の部分は、好きな言葉に変えても OK。",
        hintDefault:
          "`name.textContent = \"...\";` の形をそのまま書こう。クォーテーション(`\"`)で文字を囲むのがポイント。",
      },
      {
        id: "5-2",
        title: "完成!",
        instruction:
          "Lesson 5 クリア!🎉\n\nたった 1 行で、画面の文字が書き換わったね。これが **JavaScript の最初の一歩**。\n\n3 周目では、入力フォームから自分でカードを編集できるところまでいくよ。\n\n次は Lesson 6 で、ここまでの 5 つのレッスンを振り返って、全体像をまとめよう。",
        hintDefault: "",
      },
    ],
  },
  {
    id: 6,
    round: 1,
    paid: false,
    kind: "recap",
    title: "1 周目クリア!",
    overview:
      "ここまでの 5 つのレッスンで、あなたは Web 制作の全体像を一周しました。HTML / CSS / JavaScript / Sparkコーチ — 4 つの役割を、自分の手で動かして体験しました。",
    concept: "1 周目で学んだ全体像を振り返る",
    // recap は実コードを書かないが、Preview コンポーネントは依然として
    // 型を要求するので "html" を入れておく(実際は描画されない)。
    previewMode: "html",
    previewCss: "",
    steps: [
      {
        id: "6-1",
        title: "振り返り完了",
        instruction: "ここまでよくがんばったね!1 周目クリアおめでとう!",
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
