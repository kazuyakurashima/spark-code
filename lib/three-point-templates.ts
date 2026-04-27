/**
 * §3.4 / §9.6 の 3 点セット(できたこと / カードの進化 / 次の楽しみ)。
 *
 * AI を使わない決め打ちテンプレート。レッスンごとに **苦労度合い 3 種**
 * (perfect / struggled / persevered)で文面を切り替え、合計 6 レッスン ×
 * 3 種 = 18 件。
 *
 * 苦労度合いの分類は §9.6 の規定(ヒント使用回数 / リトライ回数で切替)
 * を、暗黙判断 1 の閾値で実装する:
 *   perfect    : maxTries === 1 && totalHints === 0
 *   struggled  : maxTries <= 3 && totalHints <= 1
 *   persevered : それ以外(リトライ多め or ヒント 2 回以上)
 *
 * Lesson 6 (recap) は Lesson6Recap コンポーネントが画面全体で祝うため、
 * 本番では Phase 3.1 で 3 点セット発火しない。データだけ残しておくのは
 * 一覧の completeness と、将来 recap UI が変わった場合の差し替え用。
 */

export type EffortLevel = "perfect" | "struggled" | "persevered";

export type ThreePoints = {
  /** 「○○できるようになった」過去形(§3.4) */
  didLearn: string;
  /** 「あなたのカードがどう進化したか」 */
  cardEvolved: string;
  /** 「次のレッスンで何が楽しみか」 */
  nextFun: string;
};

const THREE_POINTS: Record<number, Record<EffortLevel, ThreePoints>> = {
  // ─── Lesson 1: 名前を画面に表示しよう ──────────────────────────────
  1: {
    perfect: {
      didLearn:
        "`<h1>` (見出しタグ) で自分の名前を画面に表示できるようになりましたね",
      cardEvolved:
        "真っ白だった画面に、あなたの名前が大きく堂々と表示されるようになりました",
      nextFun:
        "次は `<p>` (段落タグ) で自己紹介文を加えて、もっとあなたらしいページにしていこう",
    },
    struggled: {
      didLearn:
        "タグの形に少し迷いながらも、最後は `<h1>` で名前を表示できるようになりましたね",
      cardEvolved:
        "コードの書き方を 1 つ覚えただけで、画面にあなたの存在が現れるようになりました",
      nextFun:
        "次は `<p>` で自己紹介文を加える練習。同じ「タグで挟む」形だから、今度はもっとスムーズに書けるはず",
    },
    persevered: {
      didLearn:
        "タグの開始と終了の関係を実感しながら、最後は自分の手で `<h1>` を完成させられましたね",
      cardEvolved:
        "何度かトライした分、画面に出た名前への愛着がきっと深いです",
      nextFun:
        "次は `<p>` で自己紹介文。さっき覚えた『タグで挟む』をそのまま使うだけだから大丈夫",
    },
  },

  // ─── Lesson 2: 自己紹介文を表示しよう ──────────────────────────────
  2: {
    perfect: {
      didLearn:
        "`<p>` (段落タグ) で自己紹介文を画面に出せるようになりましたね",
      cardEvolved:
        "名前だけだったページに、あなたの言葉が加わって「自己紹介ページ」らしくなりました",
      nextFun:
        "次は好きなものリストを `<ul>` (リスト) で並べて、もっとあなたらしさを見せていきます",
    },
    struggled: {
      didLearn:
        "`<p>` の使い方を確かめながら、自己紹介文を表示できるようになりましたね",
      cardEvolved:
        "名前の下にあなたの一文が出て、ぐっとページらしい厚みが出ました",
      nextFun:
        "次は `<ul>` `<li>` でリストを作る練習。タグの中にタグを入れる、新しい体験が待ってる",
    },
    persevered: {
      didLearn:
        "Lesson 1 で覚えた「タグで挟む」を、`<p>` でも応用できるようになりましたね",
      cardEvolved:
        "タグの種類が 1 つ増えるだけで、ページの情報がぐっと厚くなることが体感できました",
      nextFun:
        "次は `<ul>` `<li>` で項目を並べる。今までの応用だから、ここまで進んだあなたなら大丈夫",
    },
  },

  // ─── Lesson 3: 好きなものリストを作ろう ────────────────────────────
  3: {
    perfect: {
      didLearn:
        "`<ul>` と `<li>` を組み合わせて、好きなものをリストにできるようになりましたね",
      cardEvolved:
        "名前と自己紹介の下に、あなたの「好き」が並んで、自分らしさが一気に増しました",
      nextFun:
        "次は CSS で文字の色を変える挑戦。見た目を自分の好きな色にできるようになるよ",
    },
    struggled: {
      didLearn:
        "`<ul>` の中に `<li>` を並べる「入れ子」の構造を、自分で書けるようになりましたね",
      cardEvolved:
        "項目が縦に並んで、ページに『あなたが何を好きか』が見えるようになりました",
      nextFun:
        "次は色を変える CSS の世界。HTML から一歩踏み込んだ、見た目を作る楽しみが始まる",
    },
    persevered: {
      didLearn:
        "「タグの中にタグを入れる」入れ子の感覚を、自分の手でつかめるようになりましたね",
      cardEvolved:
        "`<ul>` と `<li>` のおかげで、ページが立体的に感じられるようになりました",
      nextFun:
        "次は CSS。Lesson 1〜3 で書いた HTML はそのままに、見た目だけを変える楽しみが待ってる",
    },
  },

  // ─── Lesson 4: 色を変えてみよう ────────────────────────────────────
  4: {
    perfect: {
      didLearn:
        "`<style>` の中に CSS のルールを書いて、見出しの `color` (色) を変えられるようになりましたね",
      cardEvolved:
        "真っ黒だった見出しに色がついて、ページの空気がまるごと変わりました",
      nextFun:
        "次は JavaScript で画面の文字を書き換える体験。たった 1 行のコードで魔法のように変わるよ",
    },
    struggled: {
      didLearn:
        "`<style>` の場所と CSS の書き方、自分で組み立てられるようになりましたね",
      cardEvolved:
        "文字に色がつくだけで、同じ HTML でも全然違う印象になることが体感できました",
      nextFun:
        "次は JavaScript の世界。今までと違う『動き』が、たった 1 行で開きます",
    },
    persevered: {
      didLearn:
        "「見た目を変えるのは CSS」という HTML との違いを、自分の手で確かめられましたね",
      cardEvolved:
        "コードを少し変えただけで、ページの空気がまるごと変わる感覚がつかめました",
      nextFun:
        "次は JavaScript。ここまで進んだあなたなら、1 行で文字を書き換える魔法を必ずかけられる",
    },
  },

  // ─── Lesson 5: JavaScript で文字を変えよう ──────────────────────────
  5: {
    perfect: {
      didLearn:
        "`textContent` (中身の文字) を使って、画面の文字を JavaScript で書き換えられるようになりましたね",
      cardEvolved:
        "コードを書いた瞬間、画面の文字が一瞬で変わる体験を手に入れました",
      nextFun:
        "次は Lesson 6 で 1 周目の振り返り。HTML / CSS / JavaScript の役割が一気に整理されるよ",
    },
    struggled: {
      didLearn:
        "`name.textContent = \"...\"` という新しい書き方を、自分の手で動かせるようになりましたね",
      cardEvolved:
        "画面の文字が JavaScript で動的に変わる、Web ページから Web アプリの入り口に立ちました",
      nextFun:
        "次は Lesson 6 で 1 周目クリアの祭り。3 つの言語の関係を見渡せるようになる",
    },
    persevered: {
      didLearn:
        "JavaScript の最初の 1 行『代入で画面を変える』を、自分の手でクリアできましたね",
      cardEvolved:
        "クォーテーション、セミコロン、新しい記号がたくさんあった中で、ちゃんと動くコードを書けました",
      nextFun:
        "次は Lesson 6 で 1 周目クリアのお祭り。3 周目では、もっと自由に JavaScript で動かせるようになる",
    },
  },

  // ─── Lesson 6: 1 周目クリア(recap)──────────────────────────────────
  // Phase 3.1 では Lesson6Recap が画面全体で祝うので、3 点セットは発火しない。
  // データだけ用意しておく(将来 recap UI を差し替えた場合の保険)。
  6: {
    perfect: {
      didLearn:
        "HTML / CSS / JavaScript の 3 つの役割を、自分の手で 1 周触って体験できました",
      cardEvolved:
        "真っ白だった画面に、名前 / 自己紹介 / リスト / 色 / 動き — 5 つの要素が積み上がりました",
      nextFun:
        "次の 2 周目では、このカードを『作品らしく整える』段階。角丸、影、テーマ色、hover の楽しみが待っています",
    },
    struggled: {
      didLearn:
        "1 周目を完走できたこと自体が、大きな前進です",
      cardEvolved:
        "Lesson 1 から Lesson 5 までで覚えたことが、すべてこの 1 つのカードに詰まっています",
      nextFun:
        "2 周目では、このカードに角丸・影・テーマ色を加えて、作品らしさを引き出していきます",
    },
    persevered: {
      didLearn:
        "ねばり強く 1 周目を最後まで進めたこと、それ自体が一番の成長です",
      cardEvolved:
        "苦労した分だけ、HTML / CSS / JavaScript の関係が体に染みているはずです",
      nextFun:
        "2 周目はもっとビジュアル重視。あなたが作ったカードを、見せたくなる作品に育てていきます",
    },
  },
};

/**
 * 苦労度合いの分類。暗黙判断 1 の閾値:
 *   perfect    : maxTries === 1 && totalHints === 0
 *   struggled  : maxTries <= 3 && totalHints <= 1
 *   persevered : それ以外
 *
 * @param maxTries  そのレッスンの全 step の中で一番多かった judge 試行回数
 * @param totalHints そのレッスンの全 step に対する hint_requested の合計
 */
export function classifyEffort(
  maxTries: number,
  totalHints: number,
): EffortLevel {
  if (maxTries <= 1 && totalHints === 0) return "perfect";
  if (maxTries <= 3 && totalHints <= 1) return "struggled";
  return "persevered";
}

/** Lesson + effort で 3 点セットを引く。未定義の lesson は null。 */
export function getThreePoints(
  lessonId: number,
  effort: EffortLevel,
): ThreePoints | null {
  const byEffort = THREE_POINTS[lessonId];
  return byEffort ? byEffort[effort] : null;
}
