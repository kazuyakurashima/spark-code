# SparkCode カリキュラム(全 16 レッスン)

> **位置づけ**: [PHASE3_REQUIREMENTS.md](PHASE3_REQUIREMENTS.md) §5-§8 の抜粋(§0.4 / §19.3)。
> **正本**は要件定義書側。本ファイルは「レッスン詳細を単独で参照したいとき」の閲覧用。
> **最終更新**: 2026-04-27(T19 / Phase 3.1 実装完了・検証中)

---

## Phase 3.1 実装状況サマリ

| Phase | 範囲 | 状態 |
|---|---|---|
| **Phase 3.1** | Lesson 1-6(1 周目、無料) | ✅ 実装完了(T1-T18) |
| **Phase 3.2** | 課金導線 / Stripe 結線 / 認証 | ⏳ 未着手 |
| **Phase 3.3** | Lesson 7-11(2 周目) | ⏳ 未着手 |
| **Phase 3.4** | Lesson 12-16(3 周目)+ 共有 | ⏳ 未着手 |

実装ファイルの一次入口: [lib/lessons.ts](../lib/lessons.ts)(public)/ [lib/lessons-server.ts](../lib/lessons-server.ts)(`match` / `solution` を `import "server-only"` で隔離)。

---

## 5. レッスン構成

### 5.1 全 16 レッスン一覧 + Phase 3.1 実装状況

| # | 周 | タイトル | 主な技術 | ユーザー体験 | Phase 3.1 状態 |
|---:|---|---|---|---|---|
| 1 | 1 | 名前が画面に出る | HTML / `<h1>` | 自分の名前が表示される | ✅ 実装済 |
| 2 | 1 | 自己紹介文が出る | HTML / `<p>` | 自分のページ感が出る | ✅ 実装済 |
| 3 | 1 | 好きなものリストが出る | HTML / `<ul>` / `<li>` | 自分らしさが出る | ✅ 実装済 |
| 4 | 1 | 色が変わる | CSS / `color` | 見た目が変わる体験 | ✅ 実装済 |
| 5 | 1 | 1 行 JS で文字が変わる | JS / `textContent` | 自分のコードで画面が変わる | ✅ 実装済 |
| 6 | 1 | 1 周目クリアと総合振り返り | Sparkコーチ | 全体像を一周した実感 | ✅ 実装済(recap kind) |
| 7 | 2 | カード型にまとめる | HTML / `<div>` | 作品の器ができる | ⏳ Phase 3.3 |
| 8 | 2 | 余白を整える | CSS / `padding` / `margin` | 見やすくなる | ⏳ Phase 3.3 |
| 9 | 2 | 角丸と影をつける | CSS / `border-radius` / `box-shadow` | プロっぽくなる | ⏳ Phase 3.3 |
| 10 | 2 | 背景・テーマ色と Tailwind 翻訳 | CSS → Tailwind | 現代的な書き方を体験 | ⏳ Phase 3.3 |
| 11 | 2 | hover で触りたくする | Tailwind / `hover:` / `transition` | プロっぽくなる | ⏳ Phase 3.3 |
| 12 | 3 | 入力した名前を反映する | JS / `<input>` / `value` / `addEventListener` | カードを編集できる | ⏳ Phase 3.4 |
| 13 | 3 | 自己紹介文も反映する | JS | アプリ感が増す | ⏳ Phase 3.4 |
| 14 | 3 | 色を選んで反映する | JS / `classList` | カスタマイズ感 | ⏳ Phase 3.4 |
| 15 | 3 | Sparkコーチの仕上げレビュー | AI レビュー | 成長実感と改善点 | ⏳ Phase 3.4 |
| 16 | 3 | 完成・共有・発表 | 統合 | 人に見せたくなる | ⏳ Phase 3.4 |

### 5.2 カード進化マトリクス

**1 周目で登場した各要素が、2 周目・3 周目でどう進化するかの一覧。**
このマトリクスが「3 段階」ではなく「3 周」であることを担保する。

| 要素 | 1 周目で登場 | 2 周目で進化 | 3 周目で進化 |
|---|---|---|---|
| **名前** `<h1>` | L1: 表示する | L8: 周りに余白 / L9: フォントサイズ調整可 | L12: 入力欄から反映 |
| **自己紹介文** `<p>` | L2: 表示する | L8: 余白で読みやすく | L13: 入力欄から反映 |
| **好きなもの** `<ul><li>` | L3: 表示する | L9: 角丸の背景タグ風に装飾 | (発展課題、Phase 3.4 で項目追加機能を検討) |
| **色** | L4: 文字色を 1 つ変える | L10: テーマ色から選択 / Tailwind 表記 | L14: ボタンで動的に変える |
| **動き** | L5: 1 行 JS で文字変更を体験 | L11: hover で触ると反応 | L12-14: 自分で書く JS |
| **カード構造** | (未登場) | L7: `<div>` でまとめる | (構造維持、要素のみ動的化) |
| **影と装飾** | (未登場) | L9: shadow / radius | L11 で hover 時に影が深まる |

**この表を読むと、各要素が 3 回登場することがわかる。これが定着を生む。**

### 5.3 課金境目

- **無料**: Lesson 1〜6(1 周目全体)
- **有料(SparkPlus)**: Lesson 7〜16(2 周目以降)

詳細は [PHASE3_REQUIREMENTS.md §11](PHASE3_REQUIREMENTS.md#11-課金導線)。Phase 3.1 では UI のみ([components/UpsellBlock.tsx](../components/UpsellBlock.tsx))、Stripe 結線は Phase 3.2。

---

## 6. 1 周目詳細(Lesson 1〜6、無料)— Phase 3.1 で全実装済

### Lesson 1:名前が画面に出る

- **目的**: HTML を書いたら画面に表示される、という最初の成功体験を作る
- **主な技術**: `<h1>`
- **ユーザーが書くコード例**:
  ```html
  <h1>かず</h1>
  ```
- **判定**: `<h1>` タグが存在し、中身が空でない(プレースホルダ「名前」のままは不合格)
- **Sparkコーチの 3 点セット例**:
  > 今日できるようになったこと: HTML で名前を画面に表示できました。
  > あなたのカードの進化: 何もなかった画面に、あなたの名前が生まれました。
  > 次の楽しみ: 次は自己紹介文を追加して、もっとあなたらしいページにします。
- **実装**: [lib/lessons-server.ts](../lib/lessons-server.ts) の `match` / `lib/three-point-templates.ts` の `THREE_POINTS[1]`

### Lesson 2:自己紹介文が出る

- **目的**: 名前だけでなく、文章を追加してページらしくする
- **主な技術**: `<p>`
- **ユーザーが書くコード例**:
  ```html
  <h1>かず</h1>
  <p>水戸の塾で先生をしています</p>
  ```
- **判定**: `<p>` タグが存在し、中身が空でない
- **ユーザー体験**: 自己紹介文が表示される、自分のページ感が出る

### Lesson 3:好きなものリストが出る

- **目的**: 自分らしさを表現できる要素を追加する
- **主な技術**: `<ul>`, `<li>`
- **ユーザーが書くコード例**:
  ```html
  <h1>かず</h1>
  <p>水戸の塾で先生をしています</p>
  <ul>
    <li>司馬遼太郎</li>
    <li>歴史</li>
    <li>ジャズ</li>
  </ul>
  ```
- **判定**: `<ul>` 内に `<li>` が 2 つ以上存在
- **ユーザー体験**: 好きなものを並べて、自分らしさが出る

### Lesson 4:色が変わる

- **目的**: CSS によって見た目が変わることを体験する
- **主な技術**: `color`
- **重要**: ここで初めて `<style>` タグが登場する。CSS を書く場所として導入する
- **ユーザーが書くコード例**:
  ```html
  <style>
    h1 { color: pink; }
  </style>
  <h1>かず</h1>
  ...
  ```
- **判定**: `<style>` 内に `color` プロパティが存在し、初期値(black)以外に変更されている。セレクタは `h1` を対象とする(`.h1` / `#h1` / `:not(h1)` などの誤一致を避けるため、Group 1 round 3 でセレクタ tokenize に変更)

### Lesson 5:1 行 JS で文字が変わる

- **目的**: JavaScript によって画面の内容が変わることを、最小負荷で体験する
- **主な技術**: `textContent`
- **重要**: `addEventListener`、`querySelector`、`input.value` は **学習者に書かせない**
- **実装方針**: `document.querySelector` はシステム側のお膳立てコードとして非表示。学習者が書くコードは **必ず 1 行だけ** に固定する
- **ユーザーが書くコード例**:
  ```js
  name.textContent = "こんにちは!";
  ```

  お膳立てコード例:
  ```js
  // この行はシステム側で用意し、学習者には書かせない
  const name = document.querySelector("#name");

  // 学習者が書くのはこの1行だけ
  name.textContent = "こんにちは!";
  ```

- **判定**: `name.textContent = ...` の代入式が存在する(リテラル `name` 識別子限定。Group 2 で任意識別子を許容しない方向に締めた)
- **ユーザー体験**: 自分が 1 行コードを書いたことで、画面の文字が変わる
- **Sparkコーチからの予告**: 「これは JavaScript の世界です。3 周目で自分でもっと書けるようになります」
- **iframe**: Lesson 5 のみ `sandbox="allow-scripts"`(他のレッスンは `sandbox=""`)

### Lesson 6:1 周目クリアと総合振り返り

- **目的**: 1 周目の達成感を作り、課金導線につなげる
- **内容**:
  - 1 周目で扱った 5 つの要素(名前・自己紹介・リスト・色・動き)の振り返り
  - HTML / CSS / JavaScript / Sparkコーチの全体像確認
  - Sparkコーチからの総合振り返り
  - 「未来のカード」プレビュー(現在のカード vs 完成形を並べて見せる)
  - 課金誘導: 「SparkPlus でカードを育てる」ボタン
- **重要**: ここでは新しいコードは書かせない。「祭り」のレッスン
- **実装**: [components/Lesson6Recap.tsx](../components/Lesson6Recap.tsx) / [components/FuturePreview.tsx](../components/FuturePreview.tsx) / [components/UpsellBlock.tsx](../components/UpsellBlock.tsx)
- **Sparkコーチの総合振り返り例**:
  > ここまでで、あなたは Web 制作の全体像を一周できました。
  > HTML で中身を作り、CSS で見た目を変え、JavaScript で画面を変化させました。
  > わからないところは私(Sparkコーチ)に聞きながら、ここまで進んでこられましたね。
  > ここから先は、このカードをもっと作品らしく育てていきます。
  > 角丸、影、テーマ色、入力で変わる仕組みまで。
  > 一緒に進みましょう。

---

## 7. 2 周目詳細(Lesson 7〜11、有料)— Phase 3.3 で実装予定

### Lesson 7:カード型にまとめる

- **目的**: 要素をひとまとまりにし、作品の器を作る
- **主な技術**: `<div>`
- **ユーザーが書くコード例**:
  ```html
  <div class="card">
    <h1>かず</h1>
    <p>水戸の塾で先生をしています</p>
    <ul>...</ul>
  </div>
  ```
- **お膳立てされた CSS**: `.card` には事前に `width: 320px; margin: auto; background: white;` 程度を入れておく
- **判定**: `<div>` で全要素が囲まれている

### Lesson 8:余白を整える

- **目的**: 見やすさを改善する
- **主な技術**: `padding`, `margin`
- **進化対象**: 名前(L1)、自己紹介(L2)、リスト(L3)の周りに余白を作る
- **ユーザーが書くコード例**:
  ```css
  .card { padding: 24px; }
  h1 { margin-bottom: 8px; }
  ```

### Lesson 9:角丸と影をつける

- **目的**: カードらしさを一気に出す
- **主な技術**: `border-radius`, `box-shadow`
- **進化対象**: カード全体、好きなものリスト(L3)の各項目に背景色 + 角丸で「タグ風」にする
- **ユーザーが書くコード例**:
  ```css
  .card {
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }
  li {
    background: #fce7f3;
    padding: 4px 12px;
    border-radius: 999px;
    display: inline-block;
  }
  ```

### Lesson 10:背景・テーマ色と Tailwind 翻訳

- **目的**: CSS で書いたことを Tailwind で表現できることを理解する
- **主な技術**: `background`, Tailwind utility classes
- **重要**: Tailwind を「**CSS の翻訳**」として導入する。突然出さない
- **CSS と Tailwind の対応表**:

  | CSS | Tailwind |
  |---|---|
  | `color: white;` | `text-white` |
  | `background-color: #ec4899;` | `bg-pink-500` |
  | `padding: 16px;` | `p-4` |
  | `border-radius: 12px;` | `rounded-xl` |
  | `box-shadow: 0 4px 20px rgba(0,0,0,0.1);` | `shadow-lg` |

- **ユーザー体験**:
  1. まず Lesson 9 までの CSS をそのまま見せる
  2. Sparkコーチが「**プロは同じことを Tailwind で書きます。短くて読みやすいです**」と紹介
  3. 同じカードを Tailwind で書き直す
  4. テーマ色を `bg-pink-500` から `bg-blue-500` に変えるだけで雰囲気が変わることを体験

### Lesson 11:hover で触りたくする

- **目的**: 触ると反応する楽しさを作る
- **主な技術**: `hover:`, `transition`
- **進化対象**: カード全体、リストの各タグ
- **ユーザーが書くコード例**:
  ```html
  <div class="card hover:shadow-2xl transition">
    ...
    <li class="hover:bg-pink-300 transition">司馬遼太郎</li>
  </div>
  ```

---

## 8. 3 周目詳細(Lesson 12〜16、有料)— Phase 3.4 で実装予定

### Lesson 12:入力した名前を反映する

- **目的**: 入力欄の文字をカードに反映する
- **主な技術**: `<input>`, `value`, `addEventListener`, `textContent`
- **進化対象**: 名前(L1, L8)を入力で動的に変更
- **ユーザーが書くコード例**:
  ```html
  <input id="name-input" placeholder="名前を入力" />
  <h1 id="name">かず</h1>
  <script>
    const input = document.querySelector("#name-input");
    const name = document.querySelector("#name");
    input.addEventListener("input", () => {
      name.textContent = input.value;
    });
  </script>
  ```
- **重要**: ここで初めて `addEventListener` と `input.value` を導入する。Lesson 5 の予告が回収される

### Lesson 13:自己紹介文も反映する

- **目的**: 名前だけでなく、自己紹介文も変更できるようにする
- **主な技術**: 既存処理の応用、`<textarea>` の導入
- **学習ポイント**: 「同じパターンを繰り返す」体験。L12 で覚えたコードを応用するだけ

### Lesson 14:色を選んで反映する

- **目的**: 見た目を自分でカスタマイズできるようにする
- **主な技術**: `event`, `classList`, テーマ選択
- **進化対象**: テーマ色(L10)をボタンで動的に変える

### Lesson 15:Sparkコーチの仕上げレビュー

- **目的**: 完成前に、自分のコードやカードを Sparkコーチに見てもらう
- **重要**: このレッスンでは新しいコードは書かない。**Sparkコーチが学習者のカード全体を評価するレッスン**
- **Sparkコーチのレビュー観点**:
  - よくできている点(具体的に 2-3 つ)
  - コード上の改善点(あれば、なくても OK)
  - 見た目の改善案(任意)
  - これまでの 14 レッスンで成長した点
- **実装方針**: 学習者の最終コードと学習ログ(`learning_events`)を渡し、Sparkコーチが評価コメントを返す

### Lesson 16:完成・共有・発表

- **目的**: 完成体験と共有体験を作る
- **内容**:
  - 完成画面を表示(BGM や紙吹雪エフェクトでも良い)
  - **共有用 URL を発行**(独自ドメインまたは sparkcode.app/cards/xxx 形式)
  - SNS 投稿文(コピー可能テキスト)を生成
  - Sparkコーチが最後のコメントを返す

---

## 関連ドキュメント

- 正本(全要件): [PHASE3_REQUIREMENTS.md](PHASE3_REQUIREMENTS.md)
- 学習設計の原則: [PHASE3_REQUIREMENTS.md §3](PHASE3_REQUIREMENTS.md#3-学習設計の原則)
- Sparkコーチ仕様: [SPARK_COACH.md](SPARK_COACH.md)
- 課金導線: [PHASE3_REQUIREMENTS.md §11](PHASE3_REQUIREMENTS.md#11-課金導線)
- Phase 3.1 タスク管理: [TODO_PHASE3.md](TODO_PHASE3.md)
- Phase 3.1 適合チェック: [PHASE3_REQUIREMENTS_CHECK.md](PHASE3_REQUIREMENTS_CHECK.md)
