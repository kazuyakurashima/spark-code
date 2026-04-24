// Client-safe lesson data. Answer keys and match logic live in
// lib/lessons-server.ts ("server-only") so they never ship to the browser.

export type LessonStep = {
  id: string;
  title: string;
  instruction: string;
  hintDefault: string;
};

export type Lesson = {
  id: number;
  title: string;
  overview: string;
  previewCss: string;
  steps: LessonStep[];
};

const LESSON_1_PREVIEW_CSS = `
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
h1 {
  font-size: clamp(2.5rem, 9vw, 6rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  text-shadow: 0 8px 40px rgba(0, 0, 0, 0.25);
}
`.trim();

export const lessons: Lesson[] = [
  {
    id: 1,
    title: "名前を画面に表示しよう",
    overview:
      "HTML の `<h1>` タグを使って、画面に自分の名前を表示します。これだけで、こんなに綺麗な画面が作れるよ。",
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
          "おめでとう!Lesson 1 クリアだ 🎉\n\n`<h1>` タグだけで、画面いっぱいの綺麗なデザインが作れたね。\n\n次のレッスン(色を変える・背景を装飾する など)は **Coming Soon**。お楽しみに!",
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
