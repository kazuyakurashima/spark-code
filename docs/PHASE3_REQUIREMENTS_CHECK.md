# PHASE3_REQUIREMENTS_CHECK.md

> 各 TODO 完了時に追記する要件適合チェックの記録。
> 形式は要件定義書 §13.4 を踏襲。
> 雛形(下のテンプレート)を **コピーして** 各タスク用に埋める運用にする。
> Phase 3.1 のみ対象。Phase 3.2 以降は別ファイルに切り出すか、本ファイルに章を追加するかは Phase 3.1 完了時点で判断。

---

## このファイルの使い方

1. [docs/TODO_PHASE3.md](TODO_PHASE3.md) で承認された TODO に着手
2. 実装 + コミット完了時、本ファイルの末尾に **「テンプレート」セクションをコピー**して、該当 TODO 用に埋める
3. 自己評価 OK だけ「次のタスクに進める」
4. 自己評価 要修正 → 修正 → 再記録 → OK になるまでループ
5. Phase 3.1 全 21 タスク完了時に、本ファイル全体を読み返してから Codex Review(T21)に進む

---

## テンプレート(コピーして使う)

```md
## T{番号}: {タイトル}

- 対応要件: §X.Y(複数可)
- 実装内容:
  - {実装した変更を 2-5 行で}
- 主な変更ファイル:
  - path/to/file1
  - path/to/file2
- 要件定義書との差分:
  - **なし** / **あり**
- 差分がある場合の理由:
  - {要件 §X.Y は ... と書かれているが、実装は ... にした。理由は ...}
- 連動 / 未対応 TODO:
  - {例: T15 の苦労度閾値が前提。Phase 3.2 の §9.8 で「3 回失敗で誘導」を追加予定}
- 自己評価:
  - **OK** / **要修正**
- 自己評価のメモ:
  - {OK 理由 or 要修正点}
- コミット:
  - `<sha>` `<commit message>`
```

---

## 記録(タスク完了順に追記)

> ここから下に T1, T2, ... の順で追記していく。

<!-- T1 以降の記録はここに追加 -->

## T1: lessons.ts のデータモデル拡張(3 周構造 / 課金境界 / プレビュー設定)

- 対応要件: §4 / §5.1 / §5.3 / §6 / §10.3
- 実装内容:
  - `LessonRound`(`1 | 2 | 3`)/ `LessonPreviewMode`(`"html" | "html+css" | "html+css+js"`)/ `LessonEditorLanguage`(`"html" | "javascript"`)/ `LessonScaffold`(`{beforeHtml?, afterHtml?, js?}`)型を追加
  - `Lesson` 型に必須フィールド `round`, `paid`, `concept`, `previewMode` を追加し、`editorLanguage`, `scaffold`, `starterCode` をオプションで追加
  - 既存 Lesson 1 を新フィールドで埋める(`round: 1`, `paid: false`, `concept: "<h1> タグで見出しを表示する"`, `previewMode: "html"`)
  - Phase 1 で実装した `previewCss` は後方互換のためそのまま残置
- 主な変更ファイル:
  - `lib/lessons.ts`
- 要件定義書との差分:
  - **なし**
- 差分がある場合の理由:
  - (該当なし)
- 連動 / 未対応 TODO:
  - T2 で Preview コンポーネントが `previewMode` / `scaffold` を読み取るように対応
  - T3-T7 で Lesson 2〜6 の実データを追加するときに、ここで定義したスキーマで埋める
  - `LessonStep.solutionPattern` は client 側に持たない(`lib/lessons-server.ts` の `matchStep` / `getSolution` が引き続き source of truth)
- 自己評価:
  - **OK**
- 自己評価のメモ:
  - 型のみの追加で、ランタイム挙動は変わらない(`previewCss` 経路は維持)
  - tsc / lint クリーン
  - 後段(T2)が `lesson` オブジェクト全体を Preview に渡せるよう、必要なメタはすべて公開フィールドにある
- コミット:
  - (T1 単独コミットの sha は本ファイルの commit と同タイミングで記録)

## T2: Preview コンポーネントの動的設定対応(sandbox 切替 / scaffold 注入)

- 対応要件: §6 L4 / §6 L5 / §10.3 / §16.2
- 実装内容:
  - Preview の Props を `{code, previewCss}` から `{code, lesson}` に変更し、レッスンメタを直接受け取る形に
  - `buildSrcDoc(code, lesson)`:
    - `scaffold.beforeHtml` / `scaffold.afterHtml` で学習者コードを挟む
    - `previewMode === "html+css+js"` のときだけ `<script>` ブロックを生成
    - `editorLanguage === "javascript"` のときは学習者コードを `<script>` 側に流し、HTML 側には載せない(Lesson 5 想定)
  - `sandboxFor(lesson)`: `html+css+js` のときだけ `"allow-scripts"`、それ以外は素の `""`(最小権限の原則)
  - LessonWorkspace の Preview 呼び出しを `code + lesson` 形式に更新
  - 学習者コードと scaffold の境界を `<!-- learner-code-begin/end -->` / `<!-- scaffold-begin/end -->` HTML コメントで識別可能に(将来のデバッグ用)
- 主な変更ファイル:
  - `components/Preview.tsx`
  - `components/LessonWorkspace.tsx`
- 要件定義書との差分:
  - **なし**
- 差分がある場合の理由:
  - (該当なし)
- 連動 / 未対応 TODO:
  - T5(Lesson 4)で `<style>` を含む学習者コードがそのまま srcDoc に流れることを確認する
  - T6(Lesson 5)で `editorLanguage: "javascript"` + scaffold.beforeHtml + scaffold.js の組み合わせを Lesson データ側で検証する
  - 現時点で Lesson 1 は `previewMode: "html"`, scaffold 未指定なので、ルートは旧仕様と完全互換
- 自己評価:
  - **OK**
- 自己評価のメモ:
  - dev で `/lesson/1` 動作確認: 200 / `sandbox=""` 1 件 / `sandbox="allow-scripts"` 0 件 / `<h1>名前</h1>` で judge → `correct: true`
  - tsc / lint クリーン
- コミット:
  - (T2 単独コミットの sha は commit と同タイミングで記録)

## T3: Lesson 2(自己紹介文 `<p>`)

- 対応要件: §5.1 #2 / §6 Lesson 2 / §3.5 / §5.2(`<p>` の 1 周目登場)
- 実装内容:
  - `BASE_PREVIEW_CSS` を抽出し、Lesson 1 / 2 の previewCss はこれを extend する形に refactor
  - Lesson 2 の `LESSON_2_PREVIEW_CSS` で `<h1>` のサイズを少し縮め、`<p>` の組版(`max-width: 36ch` / `line-height: 1.7` / 半透明白)を追加(§3.3 1 レッスン 1 つの見た目変化)
  - Lesson 2 のステップ構成は **2 ステップ**(2-1: 自己紹介を 1 行書く / 2-2: 完成)。Lesson 1 の 3 ステップから一段階軽くした(タグ構文は L1 で経験済みのため §3.1 を尊重)
  - `starterCode: "<h1>かず</h1>\n"` を Lesson 2 に設定。**Lesson 1 の成果物が引き継がれる体験**(§4.2 真の 3 周構造の precursor)
  - `LessonWorkspace` の `useState` 初期値と `handleRestart` 内 `setCode` を `lesson.starterCode ?? ""` に更新
  - `lessons-server.ts` に `2-1` matcher(`<p>...</p>` で trim 後非空)、`2-2` always-true、対応 solution を追加
- 主な変更ファイル:
  - `lib/lessons.ts`
  - `lib/lessons-server.ts`
  - `components/LessonWorkspace.tsx`
- 要件定義書との差分:
  - **あり**(軽微)
- 差分がある場合の理由:
  - §6 Lesson 2 の判定文「`<p>` タグが存在し、中身が空でない」を素直に正規表現化したが、ステップ数を **3 ステップではなく 2 ステップ** に圧縮。理由: Lesson 1 でタグ構文を 2 ステップ(1-1: 形を覚える、1-2: 自分の名前に変える)で 1 度学習済みのため、Lesson 2 でも同じパターンを反復させると §3.1「1 レッスン 1 新概念」を超える冗長になる。Lesson 2 の新概念は `<p>` という新タグだけなので 1 ステップ + 完成ステップで十分と判断。
- 連動 / 未対応 TODO:
  - T4 で Lesson 3 の `<ul><li>` を追加するときに、同じ「starterCode で前レッスンの成果を持ち越す」パターンを踏襲
  - 現状 Lesson 間の遷移 UI なし。URL 直叩き(`/lesson/2`)で動作する。Lesson 切替 UI は T8(現在地表示バー)以降で検討
- 自己評価:
  - **OK**
- 自己評価のメモ:
  - 5 つのエッジケース通過(`<p>こんにちは</p>` 合格 / `<p></p>` 不合格 / `<p>   </p>` 不合格 / 自己紹介文 合格 / `<p>` なし 不合格)
  - Lesson 1 / Lesson 2 とも `/lesson/x` 200 OK
  - tsc / lint クリーン
- コミット:
  - (T3 単独コミットの sha は commit と同タイミングで記録)

## T4: Lesson 3(好きなものリスト `<ul><li>`)

- 対応要件: §5.1 #3 / §6 Lesson 3 / §5.2 行「好きなもの」
- 実装内容:
  - `LESSON_3_PREVIEW_CSS` を追加。`list-style: none` でブレットを消し、`flex` + `gap` で縦に整然と並べる(2 周目 Lesson 9 で「タグ風装飾」を加算する余地を残す)
  - Lesson 3 を 2 ステップ構成で追加(3-1: リストを書く / 3-2: 完成)
  - `starterCode: "<h1>かず</h1>\n<p>水戸の塾で先生をしています</p>\n"` で前 2 レッスンの成果を引き継ぎ
  - `concept: "<ul> と <li> で項目のリストを作る"`
  - `lessons-server.ts` に `3-1` matcher を追加: `<ul>...</ul>` 内に `<li>` が **2 つ以上**、各 `<li>` が trim 後非空。`<ol>` のみは不合格(明示的に `<ul>` 必須)
- 主な変更ファイル:
  - `lib/lessons.ts`
  - `lib/lessons-server.ts`
- 要件定義書との差分:
  - **なし**(§6 Lesson 3「`<ul>` 内に `<li>` が 2 つ以上存在」をそのまま実装)
- 連動 / 未対応 TODO:
  - Lesson 9(2 周目)で `<li>` をタグ風装飾(`background` + `border-radius`)に進化させる前提を `LESSON_3_PREVIEW_CSS` の `<li>` に余白を残して維持(§5.2 進化マトリクス)
- 自己評価:
  - **OK**
- 自己評価のメモ:
  - 5 つのエッジケース通過(2 項目 OK / 1 項目 NG / `<ol>` 単独 NG / 空 `<li>` 含む NG / 改行 + 全角文字 OK)
  - tsc / lint クリーン
  - `/lesson/3` 200 OK
- コミット:
  - (T4 単独コミットの sha は commit と同タイミングで記録)

## T5: Lesson 4(色を変える、`<style>` 導入)

- 対応要件: §5.1 #4 / §6 Lesson 4 / §3.5
- 実装内容:
  - Lesson 4 専用 `LESSON_4_PREVIEW_CSS`: 背景を白系(`#f8fafc`)、`<h1>` の初期 `color: black`、`<p>` `<li>` は slate-600 系。「初期は地味、CSS で色を変えると激変」というコントラストを優先(BASE_PREVIEW_CSS の gradient とは別ステージ)
  - Lesson 4 を 2 ステップ構成(4-1: 見出しの色を変える / 4-2: 完成)
  - `previewMode: "html+css"`(現状の Preview 動作は `html` と同じだが、意図を型で表明)
  - `starterCode` は **空の `<style></style>`** + 前レッスンまでの HTML。学習者は `<style>` の中に CSS ルールを 1 行書くだけで進める設計
  - `concept: "<style> タグに CSS を書いて文字色を変える"`、§3.5 を意識して overview / instruction 文では「色」「見せ方」を先に出し、`<style>` / `color` の技術名は後段に登場
  - matcher: `<style>...</style>` 内に `color:` 宣言があり、値が黒系(`black` / `#000` / `#000000` / `rgb(0,0,0)` / `rgba(0,0,0,1)` / `rgb(0%,0%,0%)` / `hsl(0,0%,0%)`)以外。`background-color` 等は `(?:^|[^-])color` で除外
  - `lessons-server.ts` の matcher / solution に `4-1` / `4-2` を追加
- 主な変更ファイル:
  - `lib/lessons.ts`
  - `lib/lessons-server.ts`
- 要件定義書との差分:
  - **なし**(§6 Lesson 4 の判定文「`<style>` 内に `color` プロパティが存在し、初期値(black)以外」を素直に実装)
- 連動 / 未対応 TODO:
  - Lesson 7(Phase 3.3 後半)で `<div class="card">` を導入するときに、白背景ベースの Lesson 4 stage はカード装飾の前段階として接続しやすい
- 自己評価:
  - **OK**
- 自己評価のメモ:
  - 9 つのエッジケース通過(`pink` 合格 / `black` 不合格 / `#ff0000` 合格 / 空 style 不合格 / style 無し 不合格 / `font-size` のみ 不合格 / `#000000` 不合格 / `background-color` のみ 不合格 / mixed `background-color` + `color` 合格)
  - tsc / lint クリーン
  - `/lesson/4` 200 OK
- コミット:
  - (T5 単独コミットの sha は commit と同タイミングで記録)

## T6: Lesson 5(1 行 JS 体験)

- 対応要件: §5.1 #5 / §6 Lesson 5 / §16.2(1 行に留める)
- 実装内容:
  - `@codemirror/lang-javascript` を新規インストールし、`CodeEditor` に `language?: "html" | "javascript"` props を追加。エディタ内 syntax highlight が JS でも動く
  - `LessonWorkspace` から `lesson.editorLanguage` を CodeEditor に流す。デフォルト "html"
  - Lesson 5: `previewMode: "html+css+js"` + `editorLanguage: "javascript"` + `scaffold.beforeHtml: '<h1 id="name">かず</h1>'` + `scaffold.js: 'const name = document.querySelector("#name");'` + `starterCode: ""`(placeholder + instruction で誘導)
  - LESSON_5_PREVIEW_CSS は Lesson 1 と同じ vivid gradient を採用(JS による文字変化のドラマを最大化)
  - matcher: 行/ブロックコメントを strip 後、`/[A-Za-z_$][\w$]*\s*\.\s*textContent\s*=\s*['"`]/` で検出。`name` に限定せず `el.textContent = "x"` のような書き方も合格(scaffold は `name` を提供するが、判定上は寛容)
  - Phase 1 で導入した `escapeForScriptBody` を継続使用(scaffold + 学習者 JS 両方を escape)
- 主な変更ファイル:
  - `package.json` / `package-lock.json` (`@codemirror/lang-javascript` 追加)
  - `components/CodeEditor.tsx`
  - `components/LessonWorkspace.tsx`
  - `lib/lessons.ts`
  - `lib/lessons-server.ts`
- 要件定義書との差分:
  - **なし**(§16.2「1 行に留める」「`addEventListener` / `querySelector` / `input.value` を学習者に書かせない」を厳守)
- 連動 / 未対応 TODO:
  - Lesson 12-14(Phase 3.4)で `addEventListener` を導入する際、`editorLanguage` の切替パターンが既に確立しているので素直に拡張できる
  - matcher のコメント strip は naive(`"// not a comment"` のような文字列内に `//` が含まれるケースで誤動作)。完全初心者の使い方では実害なしと判断
- 自己評価:
  - **OK**
- 自己評価のメモ:
  - 8 つのエッジケース通過(基本/スペース無し/値なし/コメントアウト/innerHTML/別ident/改行/空コード)
  - sandbox="allow-scripts" が iframe に正しく付与(curl で確認)
  - scaffold beforeHtml + js が srcDoc に正しく注入(curl で確認)
  - Lesson 1〜4 回帰なし(`/lesson/1` 200 OK)
  - tsc / lint クリーン
- コミット:
  - (T6 単独コミットの sha は commit と同タイミングで記録)

---

## Phase 3.1 完了時のサマリ(T20 / T21 完了後に記入)

### 完了条件チェック(§18.1)

- [ ] ユーザーが Lesson 1〜6 を無料で体験できる
- [ ] 1 周目終了時に、HTML/CSS/JS/Sparkコーチの全体像が見える
- [ ] Lesson 6 後に自然な課金導線(UI のみ)が出る
- [ ] 各レッスンに、目的・コード入力・プレビュー・Sparkコーチフィードバックがある
- [ ] Sparkコーチの 4 役割(常設ボタン 5 つ)が UI に反映されている
- [ ] 画面上部に現在地表示がある
- [ ] ユーザーが「自分のカードが育っている」と感じられる
- [ ] [docs/TODO_PHASE3.md](TODO_PHASE3.md) が作成され、各タスクに対応要件が紐づいている
- [ ] [docs/PHASE3_REQUIREMENTS_CHECK.md](PHASE3_REQUIREMENTS_CHECK.md) が作成され、完了タスクごとの要件適合チェックが記録されている
- [ ] Codex Review で APPROVED を得る

### 検証フェーズ(§17)への引き継ぎメモ

- 大学生 3 名 / 60 代 2 名向けに何を見てほしいか
- 検証で確認したい問い 5 つ(§17.1)に対応する画面 / 文言の所在
- 検証中に Sparkコーチで何が録画されるか(§17.3)

### 検証合格基準(§17.1.4)に対する自己採点

| 検証項目 | 合格ライン | 現時点の予想(自己評価) |
|---|---|---|
| Lesson 1〜6 完走率 | 80% | _未記入_ |
| 同じ箇所でのつまずき | 60% で要修正 | _未記入_ |
| Sparkコーチ利用率 | 80% | _未記入_ |
| 1 周目後の全体像理解 | 80% | _未記入_ |
| 続きをやりたい意向 | 60% | _未記入_ |
| 498 円課金意向 | 40% | _未記入_ |
