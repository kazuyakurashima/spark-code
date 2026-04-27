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

## T7: Lesson 6(1 周目クリア + 総合振り返り)

- 対応要件: §5.1 #6 / §6 Lesson 6 / §11.1 / §11.4
- 実装内容:
  - `Lesson` 型に `kind?: "lesson" | "recap"` を追加(`LessonKind` 型)。デフォルト "lesson"
  - Lesson 6 を `kind: "recap"` で登録(round=1, paid=false, 1 ステップ "6-1" always-true)
  - 新規 [components/Lesson6Recap.tsx](../components/Lesson6Recap.tsx):
    - Header「🎉 1 周目クリア!おつかれさま!」
    - 5 要素の振り返りカード(Lesson 1-5、emoji + 学んだこと)
    - SparkCode 4 役割(HTML / CSS / JS / Sparkコーチ)概観
    - Sparkコーチ総合振り返り(§6 Lesson 6 例文を採用、Phase 3.1 では固定文 — T15 で苦労度合いに応じた切替へ拡張予定とコメント明記)
    - 未来カードプレビュー(箇条書き placeholder、`TODO Phase 3.1 (T18): 静的スナップショット比較に置換` コメント)
    - 課金 CTA placeholder(主ボタンクリックで `alert("SparkPlus は Phase 3.2 で公開予定…")`、副ボタン「後で考える」で CTA セクションを畳む / `TODO Phase 3.1 (T17): UpsellBlock` + `TODO Phase 3.2: Stripe Checkout` コメント明記)
  - LessonWorkspace に `if (lesson.kind === "recap") return <Lesson6Recap />` 分岐を追加。state / useEffect 群はそのまま走るので `lesson_started` / `step_started` / `lesson_completed` の log は通常通り発火する
- 主な変更ファイル:
  - `lib/lessons.ts`(`LessonKind` 型 + Lesson 6 entry)
  - `lib/lessons-server.ts`(matcher / solution に 6-1 追加、`6-1` は always-true)
  - `components/Lesson6Recap.tsx`(新規)
  - `components/LessonWorkspace.tsx`(分岐ロジック)
- 要件定義書との差分:
  - **なし**(§6 Lesson 6 の「コードを書かせない祭りレッスン」「5 要素の振り返り」「全体像」「Sparkコーチ総合振り返り」「未来カード」「課金導線」をすべて UI に反映)
- 連動 / 未対応 TODO:
  - T15 で 3 点セットテンプレ機構を作るとき、Lesson 6 の Sparkコーチ振り返り文を苦労度合いで切り替える(`SPARK_COACH_RECAP` 定数を replace)
  - T17 で UpsellBlock を本実装(現状の inline 課金 CTA を置換)
  - T18 で未来カードプレビューを静的スナップショット比較ビジュアルに置換
  - 学習者の Lesson 1-5 の learning_events を集計したパーソナライズ版振り返り(本タスクの user 要望にあった「1-5 周目の learning_events を集計」)は、T15 で実装予定。Phase 3.1 では Lesson 1 のみ aggregate する既存 `/api/report` と分離されているので、Round 1 全体の集計は新エンドポイント or `/api/report?round=1` 拡張になる
- 自己評価:
  - **OK**
- 自己評価のメモ:
  - `/lesson/6` 200 OK、recap で iframe なし(コード書かせないレッスンの正しい姿)
  - 「1 周目クリア」「SparkPlus でカードを育てる」「後で考える」の 3 つの主要テキストが HTML に含まれる(curl で grep -c → 1 件ずつ)
  - Lesson 1 / Lesson 5 の回帰なし(`/lesson/1` `/lesson/5` 200 OK)
  - tsc / lint クリーン
- コミット:
  - (T7 単独コミットの sha は commit と同タイミングで記録)

## T8: 現在地表示バー

- 対応要件: §10.1 / §10.2
- 実装内容:
  - 新規 [components/LocationBar.tsx](../components/LocationBar.tsx)、3 段構成:
    - **上段**: 周回プログレッション(`1 周目 [全体像] » 2 周目 [整える] » 3 周目 [動かす]`)、現在の周のみグラデーション pill でハイライト + `aria-current="step"`、過去/未来は淡色
    - **中段**: `Lesson X / 16: <title>`(分母 16 を最終形固定で表示し、§4 の 3 周構造を初心者に常に見せる)
    - **下段**: 4 役割凡例(`HTML=中身 / CSS=見た目 / JS=動き / Sparkコーチ=先生`)、`text-sm`(14px)を下限に 60 代視点を考慮
  - [components/ThreePaneLayout.tsx](../components/ThreePaneLayout.tsx) を `h-screen` → `h-full` に変更(LessonWorkspace の outer wrapper が `h-screen` + `grid-rows-[auto_1fr]` を持つため)
  - [components/LessonWorkspace.tsx](../components/LessonWorkspace.tsx) に outer wrapper(LocationBar + inner)を追加。recap モードと通常モードどちらでも LocationBar が常に画面上部に出る
  - `TOTAL_LESSONS = 16` 定数を LessonWorkspace 内に置き、§10.2 の `Lesson 4/16` 表示形式を担保
- 主な変更ファイル:
  - `components/LocationBar.tsx`(新規)
  - `components/ThreePaneLayout.tsx`(`h-screen` → `h-full`)
  - `components/LessonWorkspace.tsx`(outer wrapper + LocationBar 描画)
- 要件定義書との差分:
  - **なし**(§10.2 の表示要素 3 段すべてを実装)
- 連動 / 未対応 TODO:
  - 周回間の **ナビゲーション**(クリックで /lesson/N に飛ぶ)は §10.2 で言及されておらず、本タスクのスコープ外。Phase 3.2 以降で必要になれば追加
  - 60 代テスト時に「文字が小さい」とフィードバックが出たら下段凡例を `text-base` に上げる余地あり(§17.2 例)
- 自己評価:
  - **OK**
- 自己評価のメモ:
  - Lesson 1〜6 すべて `200 OK` で、curl で `周目` テキストが各 3 件以上検出される(React の `<!-- -->` text fragment marker の都合で完全文字列マッチは取れないが、見た目では `1 周目 [全体像]` が表示されている)
  - L6 (recap) でも LocationBar が頭に出る(curl で `周目=6` は 3 from LocationBar + 3 from celebration "1 周目クリア!" の合計、ということで recap headline と LocationBar が共存していることを確認)
  - tsc / lint クリーン
- コミット:
  - (T8 単独コミットの sha は commit と同タイミングで記録)

## T9: 既存プロンプト 4 種を §9.7 準拠に改修(judge / hint / praise / question)

- 対応要件: §9.5 / §9.7.1 / §9.7.2 / §9.7.3 / §9.7.4
- 実装内容:
  - `COMMON_TONE` を §9.5 の 6 規定に揃えて書き直し:
    - **「間違っている」は使わない、代わりに「惜しい」「あと一歩」「いい感じ」**(明示)
    - 技術名は **必ず意味も添える**(例として `<h1>` (見出しタグ)を本文に明記)
    - 「がんばろう」だけの抽象励ましを禁止
    - 長さは **3〜5 行が目安**(従来は「3〜4 文以内」、§9.5 の「行」基準に修正)
  - `stepContext()` に `今やること: ${concept}` を追加し、explain prompt(T10)にも自然に流せる形に
  - judge prompt: §9.7.2 正解分岐に整合 — 「合格を前提に何が良かったかを 2 行で具体的に褒める / コードの具体的な箇所(タグ・色名・名前など)に触れる」を明示
  - praise prompt: 既存の 1〜2 文の「合格直後の祝福」を維持。**§9.7.3 は summary 用と解釈**(praise はチャット欄の軽い喝采、summary は learning_events から引く 3 点振り返りで別物)
  - hint prompt: §9.7.4 厳守 — **完成形は絶対に示さない / 次の 1 ステップだけ / 既に書けている部分は触れない / 「次に〜してみましょう」の形 / 必要なら例 1 行**
  - question prompt: §9.7.1 厳守 — **3-5 行 / 技術名は意味を添える / 例を 1 つ示す / できれば今のコードに紐づけ**
  - `QUESTION_HINT_FORMATTING` を `FORMATTING` に rename + 文言整理(`<h1>` だけでなく `color` `textContent` などのプロパティ・関数名も対象)
- 主な変更ファイル:
  - `lib/prompts.ts`(全面書き直し相当)
- 要件定義書との差分:
  - **なし**(§9.7.3 を praise でなく summary 用と解釈した点は、要件本文の「praise / できたことを教えて」の二重ラベルを文脈で振り分けたもの。差分というより要件読解)
- 連動 / 未対応 TODO:
  - T10 で explain prompt 追加(stepContext の `今やること: ${concept}` がここで活きる)
  - T11 で improve prompt 追加(§9.7.5、`next_lesson_title` 連携)
  - T12 で summary prompt 追加(§9.7.3 を本来の summary 用途で実装)
  - T13 で diagnose prompt 追加(§9.7.2 の不正解分岐を別ボタン化)
- 自己評価:
  - **OK**
- 自己評価のメモ:
  - baseline(pre-T9)16 シナリオ vs post-T9 16 シナリオを diff:
    - 行数: 181 → 195(微増、§9.5「3-5 行」誘導の影響)
    - 「間違って」出現: 0 件(禁句ゼロ維持)
    - 「惜しい / いい感じ / 完璧 / あと一歩」出現: 5 件(温度感維持)
    - 技術名注釈の付与頻度が向上(例: `<h1>` (見出しタグ))
    - 具体性: praise が「コードを変えるとプレビューもすぐ変わるのが見えたでしょ?」のような generic から「`<h1>` (見出しタグ) の色を `color: pink;` で変えられました」のような具体に進化
  - tsc / lint クリーン
  - スナップショット保存先: [docs/snapshots/baseline_prompts.md](snapshots/baseline_prompts.md) と [docs/snapshots/post_t9_prompts.md](snapshots/post_t9_prompts.md)
- コミット:
  - (T9 単独コミットの sha は commit と同タイミングで記録)

## T10: `type=explain`「やさしく説明して」エンドポイント

- 対応要件: §9.2 先生 / §9.3「やさしく説明して」/ §9.7.1
- 実装内容:
  - `types/chat.ts` に `ChatRequestExplain { type:"explain", stepId, code }` 追加。`ChatResponseTextual` / `ChatMessage["kind"]` に `"explain"` を追加
  - `lib/prompts.ts` に `buildExplainPrompt(stepId, code)` 追加。質問文を持たない代わりに「現在のレッスンの **主要概念**(`stepContext` 経由で `concept` を流す)を 3-5 行でやさしく説明する」ことに固定。例 1 つ + 技術名注釈 + コードに紐づけ
  - `app/api/chat/route.ts` に `case "explain"` 分岐(`temperature: 0.5, maxTokens: 320`)。空応答時のフォールバックメッセージ付き
  - `LessonWorkspace.isChatResponse` の runtime guard を `"explain"` 受け入れに更新
- 主な変更ファイル:
  - `types/chat.ts` / `lib/prompts.ts` / `app/api/chat/route.ts` / `components/LessonWorkspace.tsx`
- 要件定義書との差分:
  - **なし**(§9.7.1 の 4 ルール「3-5 行 / 技術名注釈 / 例 1 つ / 今のコードに紐づけ」をすべてプロンプトに反映)
- 連動 / 未対応 TODO:
  - T14 で UI ボタンと結線(LessonWorkspace に handleExplain ハンドラを追加し、ChatPanel から呼ばれる)
- 自己評価:
  - **OK**
- 自己評価のメモ:
  - 3 シナリオで実機確認([docs/snapshots/sparkcoach_outputs.md](snapshots/sparkcoach_outputs.md) 参照)
  - Lesson 1 / 4 / 5 で内容が異なる主要概念を、技術名注釈つき 3-5 行で説明できている
- コミット:
  - `3d6d1ae feat(phase3): T10-T13 ...`(T11/T12/T13 と一緒の bundled commit)

## T11: `type=improve`「もっと良くしたい」エンドポイント

- 対応要件: §9.2 ナビゲーター(改善版)/ §9.3「もっと良くしたい」/ §9.7.5
- 実装内容:
  - `ChatRequestImprove { type:"improve", stepId, code }` を types に追加
  - `lib/prompts.ts` の `buildImprovePrompt(stepId, code)` で **`getLesson(currentLesson.id + 1)`** から次レッスンタイトル + concept を引き当て、user prompt に埋め込む。次レッスンが無い(Lesson 6 / Lesson 16)場合は generic な周回予告に倒すフォールバック
  - prompt のルール: 「いまのコードでよくできている点 1 行 + **次レッスンで実現できる予告 1 つ** / **具体的なコードは絶対に示さない**(予告のみ)/ 全体 2-3 行」
  - route に `case "improve"` 分岐(`temperature: 0.7, maxTokens: 220`)
  - LessonWorkspace.isChatResponse 拡張
- 主な変更ファイル: T10 と同じ 4 ファイル
- 要件定義書との差分:
  - **なし**(§9.7.5 の 3 ルール準拠)
- 連動 / 未対応 TODO:
  - T14 で UI ボタンと結線
- 自己評価:
  - **OK**
- 自己評価のメモ:
  - 4 シナリオで実機確認:Lesson 1-2 → Lesson 3 予告 / Lesson 4-1 → Lesson 5 (JS 予告)/ Lesson 5-1 → Lesson 6 (全体像予告)/ Lesson 6-1 (recap、次レッスン未実装)→ generic 周回予告
  - 具体的なコードは出力していない(予告のみ)
- コミット: `3d6d1ae`

## T12: `type=summary`「できたことを教えて」エンドポイント(learning_events 集計 / sparseness 対応付き)

- 対応要件: §9.2 応援者 / §9.3「できたことを教えて」/ §9.7.3
- 実装内容:
  - `ChatRequestSummary { type:"summary", stepId, sessionId }` を types に追加(他の type と違い `code` は不要)
  - route の `case "summary"` で **`getSupabaseServer()`** 経由(service_role)で当該 sessionId の `learning_events` を直近 20 件 select
  - **sparseness ガード**: `lesson_completed === 0 && step_completed < 3` の場合は `SUMMARY_TOO_EARLY_MESSAGE` を Claude を呼ばずに返す。「まだ振り返るには早いね!Lesson 1 を 1 つでもクリアすると、できたことを 3 つ振り返れるようになります。…」
  - has-data の場合は `formatEventsForSummary` で行を整形(`| timestamp | event_type | lesson/step | metadata excerpt |`)→ `buildSummaryPrompt` で 「3 つの過去形箇条書き + 励まし 1 行」を Claude に依頼(`temperature: 0.6, maxTokens: 360`)
  - validation: `MAX_SESSION_ID_LENGTH = 64` を route の size limits に追加
  - LessonWorkspace.isChatResponse 拡張
- 主な変更ファイル: T10 と同じ 4 ファイル
- 要件定義書との差分:
  - **なし**(§9.7.3 の 「3 箇条書き / 過去形 / 最後に 1 行励まし」を準拠 + ユーザ要望の「ログが少ない初期段階用 fallback」を SUMMARY_TOO_EARLY_MESSAGE で実装)
- 連動 / 未対応 TODO:
  - T14 で sessionId を `useEventLogger` から取って渡す結線
  - sparseness 閾値(`< 3` step_completed)は MVP 直感値。検証フィードバックで調整可
- 自己評価:
  - **OK**
- 自己評価のメモ:
  - **too-early**: 新規 sessionId(0 件)→ `SUMMARY_TOO_EARLY_MESSAGE` を Claude 呼ばずに返した(ログ確認済)
  - **has-data**: 14 件 seed(Lesson 1-1 トライ&エラー + ヒント / 1-2 一発合格 + 質問 / Lesson 2-1 一発合格 / lesson_completed for Lesson 1) → 3 つの「過去形箇条書き + 1 行励まし」が返却。期待通り「最初は失敗しましたが、ヒントをもらって…」「自己紹介文を作ることができるようになりました」のように、苦労 → 解決パターンを正しく抽出
  - test data はキャプチャ後に Supabase REST API(service_role)で 14 行 delete 済(クリーン)
- コミット: `3d6d1ae`

## T13: `type=diagnose`「どこが違う?」エンドポイント(進行を起こさない)

- 対応要件: §9.2 コード診断 / §9.3「どこが違う?」/ §9.7.2 不正解分岐
- 実装内容:
  - `ChatRequestDiagnose { type:"diagnose", stepId, code }` を types に追加。response 型は `correct` フィールドを持たない(進行と無関係であることを型で表明)
  - route の `case "diagnose"` で先に `matchStep` を実行。**合格パターンに当たっている場合は `DIAGNOSE_ALREADY_PASSING_MESSAGE`(「今のコードは合格パターンに当たっています!**「答え合わせする」** を押すと次のステップに進めますよ。」)を Claude を呼ばずに返す**(進行は judge ボタン専用で、diagnose は確認用に留める原則)
  - 不合格の場合のみ `buildDiagnosePrompt` で「差分 1 か所のみ + 修正例 1 行」を Claude に依頼(`temperature: 0.4, maxTokens: 240`)
  - prompt のルール: 「できている部分は必ず認める / 差分 1 か所のみ / 修正例 1 行 / 「間違っている」NG / **進行はあなたが起こさない** を明示」
  - LessonWorkspace.isChatResponse 拡張
- 主な変更ファイル: T10 と同じ 4 ファイル
- 要件定義書との差分:
  - **なし**(§9.7.2 不正解分岐 + 「進行を起こさない」を実装で担保)
- 連動 / 未対応 TODO:
  - T14 で UI ボタンと結線。判定 CTA「答え合わせする」とは別のサブボタンとして区別する
- 自己評価:
  - **OK**
- 自己評価のメモ:
  - 5 シナリオで実機確認:
    - 空コード → やさしいスタートメッセージ
    - 未閉じタグ → 「`</h1>` を付け足すと完成」+ 修正例 1 行
    - p セレクタ(h1 でない)→ 「`p` を `h1` に変える」+ 修正例
    - innerHTML 誤用 → 「`textContent` に変える」+ 修正例
    - **already-passing 合格コード** → `DIAGNOSE_ALREADY_PASSING_MESSAGE`(Claude を呼ばずに canned で返却)を確認
  - 進行(stepIndex 更新)は一切起きない仕様(route が `correct` を返さないので client は advance しない)
- コミット: `3d6d1ae`

## T14: ChatPanel に常設ボタン 5 つを統合

- 対応要件: §9.3 / §9.4 / §10.5(レッスン切替時履歴クリア)
- 実装内容:
  - `BusyKind` 型を `judge` / `hint` / `question` / `explain` / `improve` / `summary` / `diagnose` / `null` の 8 状態に拡張
  - `LessonWorkspace` に **4 つの新規ハンドラ**(`handleDiagnose` / `handleExplain` / `handleImprove` / `handleSummary`)を追加。すべて handleHint と同パターン(busy ガード → POST → メッセージ append → finally で busy 解除)。`handleSummary` のみ `log.sessionId` を body に渡す
  - `ChatPanel` を **全面書き直し**:
    - 新規 `QuickActions` サブコンポーネントで 2x3 グリッド + 5 個目 full-width(暗黙判断 2 通り):row1 ヒント/どこが違う?、row2 やさしく説明/できたこと、row3 もっと良くしたい(全幅)
    - 各ボタンに固有の color tone(sky/amber/violet/pink/emerald)+ 個別 busy ラベル「考え中…」
    - `bubbleClass` / `bubbleLabel` を 5 つの新 kind(diagnose=amber-soft / explain=violet / improve=emerald / summary=gradient / three-points=null label)に拡張
    - 「先生が考え中…」インジケータの発火条件を 6 種(hint/ask/diagnose/explain/summarize/improve)で OR 結合
  - `disableHint` に加えて `disableDiagnose` を新設(最終ステップでは両方無効化)。判定 CTA「答え合わせする」(LessonPanel 側)とは別経路を維持し、**diagnose は進行を起こさない**(T13 の契約)を UI 上でも区別
  - レッスン切替時の履歴クリアは Phase 1 で導入済の `key={lesson.id}` による remount で担保(全 useState がリセット)
- 主な変更ファイル:
  - `components/LessonWorkspace.tsx`(4 ハンドラ + 18 個の Props 受け渡し)
  - `components/ChatPanel.tsx`(QuickActions + 5 ボタン + bubble kind 拡張)
- 要件定義書との差分:
  - **なし**(2 件の意図的判断は要件適合の範囲内 — 下記「グループ 4 判断済み事項」参照)
- 自己評価:
  - **OK**(dev で `/lesson/1` 200 + 5 つの quick-action テキストが HTML に出現、4 endpoint smoke 200)
- 補記: Codex warning 2 件を意図的判断として保持(詳細はコード justification コメント参照)

## T15: 3 点セットのテンプレデータ作成

- 対応要件: §3.4 / §9.6
- 実装内容:
  - 新規 [lib/three-point-templates.ts](../lib/three-point-templates.ts) に `EffortLevel` / `ThreePoints` 型 + `THREE_POINTS` テーブル(Lesson 1〜6 × 3 種 = **18 件**)+ `classifyEffort(maxTries, totalHints)` + `getThreePoints(lessonId, effort)`
  - 暗黙判断 1 の閾値を採用:perfect = `tries≤1 && hints=0` / struggled = `tries≤3 && hints≤1` / persevered = それ以外
  - 各レッスンの主要概念に紐づく過去形 3 文(できたこと / カードの進化 / 次の楽しみ)を §3.4 通り
  - L6(recap)分はテーブルに含めるが Phase 3.1 では発火しない(Lesson6Recap が画面全体で祝うため)
- 主な変更ファイル: `lib/three-point-templates.ts`(新規)
- 要件定義書との差分: **なし**
- 自己評価: **OK**(18 件すべて埋まり、tsc / lint クリーン)
- コミット: `5905a77`

## T16: 3 点セット自動表示 UI

- 対応要件: §3.4 / §9.6 / §10.5「3 点セットを大きく表示、他のメッセージと差別化」
- 実装内容:
  - `types/chat.ts` の `ChatMessage` に **kind="three-points"** + `threePoints?: ThreePointsPayload` フィールドを追加
  - `LessonWorkspace` の lesson_completed ブランチで `classifyEffort(maxTries, totalHints)` → `getThreePoints(lesson.id, effort)` で template 取得 → `appendMessage({kind:"three-points", threePoints, content:plaintext fallback})`。**recap (Lesson 6) はスキップ**
  - `hintRequestsRef` を新設し `handleHint` 内で per-step インクリメント
  - `ChatPanel` に `ThreePointsCard` サブコンポーネント:3 セクション縦並び(🪄 できたこと / 🌱 カードの進化 / 🎁 次の楽しみ)、紫→ピンクのグラデ、`self-stretch` で chat 列全幅、内部は `ReactMarkdown` で技術名注釈をレンダー
  - `appendMessage` を hook 順序の都合で上に hoist、`handleRestart` で `hintRequestsRef.current = {}` を追加
- 主な変更ファイル: `types/chat.ts` / `components/LessonWorkspace.tsx` / `components/ChatPanel.tsx`
- 要件定義書との差分: **なし**
- 連動 / 未対応 TODO: L1 の Lesson1ClearReport(LessonPanel 側)と 3 点セット(ChatPanel 側)は別ペインなので併存して問題なし
- 自己評価: **OK**(tsc / lint クリーン、E2E 確認は Codex Review 後)

## T17: Lesson 6 後の課金前メッセージ + CTA 2 ボタン

- 対応要件: §11.4 / §11.5 / §11.7 / §13.5(Stripe 不可)
- 実装内容:
  - 新規 [components/UpsellBlock.tsx](../components/UpsellBlock.tsx):
    - §11.4 のメッセージを `UPSELL_LEAD` 定数で構造化(伴走 / 完成 / シェアの 3 ベクトル)
    - 主ボタン「SparkPlus でカードを育てる(早期応援 月 498 円)」 + 副ボタン「後で考える」(親 `onDismiss` で CTA 畳み)
    - 主ボタン onClick = inline notice を表示。**学習者向け文言**で「もうすぐ公開予定」「楽しみに待っていてくださいね 🎈」(暗黙判断 5 を文言改善 — 「Phase 3.2」「検証フィードバック」のような開発者ジャーゴン排除)
    - `// TODO Phase 3.2: Stripe Checkout` コメント明示
  - `Lesson6Recap` から旧 inline placeholder を `<UpsellBlock onDismiss={...} />` に置換
- 主な変更ファイル: `components/UpsellBlock.tsx`(新規)/ `components/Lesson6Recap.tsx`
- 要件定義書との差分: **なし**
- 自己評価: **OK**

## T18: 未来プレビュー UI(現在のカード vs 未来のカード)

- 対応要件: §11.6 / §6 Lesson 6
- 実装内容:
  - 新規 [components/FuturePreview.tsx](../components/FuturePreview.tsx):
    - 2 つの iframe を side-by-side 配置(`grid grid-cols-2 gap-3`)、両方 `sandbox=""`(最小権限)
    - 左: 「今のカード」(白背景 + 黒文字 + シンプル構造)
    - 右: 「未来のカード」(紫→ピンクのグラデ背景 + 角丸カード + タグ風リスト + 影)
    - 矢印 + 「**SparkPlus** でここに到達」キャプション
    - 未来カード側のみ `motion-safe:animate-[future-card-pulse_3s]` で subtle pulse
  - `app/globals.css` に `@keyframes future-card-pulse`(box-shadow + translateY を 50% でピーク)
  - `Lesson6Recap` から旧 `FUTURE_PREVIEW_BULLETS` placeholder を `<FuturePreview />` に置換
- 主な変更ファイル: `components/FuturePreview.tsx`(新規) / `app/globals.css` / `components/Lesson6Recap.tsx`
- 要件定義書との差分:
  - **軽微あり**:§6 Lesson 6「未来のカードを 1 秒だけ見せる」を、繰り返しの subtle pulse(`motion-safe:animate-[3s]`)に翻訳。文字通り 1 秒だけ表示すると「見落とすリスク」+「過剰アニメ違和感」があるため、reduced-motion 対応を担保しつつ「もうすぐ手が届く」感を継続的に出す形に調整
- 自己評価: **OK**(`/lesson/6` 200、iframe 2 つ、`今のカード` / `未来のカード` 文言確認)

## T19: ドキュメント整備(PROJECT_OVERVIEW / CURRICULUM / SPARK_COACH)

- 対応要件: §0.4(関連ドキュメント)/ §19.3(関連ドキュメントの分割)
- 実装内容:
  - **新規 [docs/CURRICULUM.md](CURRICULUM.md)**: §5-§8 抜粋(全 16 レッスン詳細)+ Phase 3.1 実装状況サマリ + レッスンごとの実装ファイルポインタ。冒頭に「正本は要件定義書側」と明示
  - **新規 [docs/SPARK_COACH.md](SPARK_COACH.md)**: §9 抜粋(Sparkコーチ仕様)+ Phase 3.1 実装マップ(仕様セクション → 実装ファイル / シンボル)+ §9.7 プロンプト方針 + §9.8 promotive 誘導の Phase 3.1 実装状況。グループ 4 判断済み事項への参照リンクも追加
  - **更新 [docs/PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)**:
    - Status 行を「Phase 3.1 完了」へ。最終更新日を 2026-04-27 に
    - 冒頭に **関連ドキュメント表** を追加(本書 / 要件定義書 / CURRICULUM / SPARK_COACH / TODO / CHECK / DEPLOY)
    - 新 §2「Phase 進捗(本書の現在地)」を追加(Phase 1 → 3.4 のロードマップ + Phase 3.1 で達成したことの 7 項目箇条書き)
    - 旧 §2(MVP のスコープ)を §3 に降格して「歴史的記録」とラベル
    - §5(AI の役割)を 4 機能 → **8 機能** に更新(judge / hint / praise / question / explain / improve / summary / diagnose、進行を起こす / 起こさないも明示)
    - §6(技術スタック)に Supabase / CSRF / lang-javascript / sandbox=allow-scripts(Lesson 5) を追加
    - §7(ファイル構成)を Phase 3.1 完了時点の **実在ファイル構成** に置換(components/lib/types/scripts/api 全部反映)
    - §3 以降を順番に renumber(§14→§15、§13→§14、…、§3→§4)+ 内部参照(`§14 参照` / `§2 の 3 条件`)も追従
- 主な変更ファイル: `docs/PROJECT_OVERVIEW.md` / `docs/CURRICULUM.md`(新規)/ `docs/SPARK_COACH.md`(新規)
- 要件定義書との差分:
  - **なし**(§19.3 が指定する 3 ファイル + §0.4 の責任分担を満たす)
- 自己評価: **OK**(3 ファイルとも `## 関連ドキュメント` 末尾セクションを揃えて相互ナビゲート可、CURRICULUM / SPARK_COACH 双方に Phase 3.1 実装状況テーブルを配置)

## T20: Phase 3.1 通し動作テスト

- 対応要件: §18.1 完了条件 10 項目
- 実装内容:
  - 新規 [docs/T20_CHECKLIST.md](T20_CHECKLIST.md) に 10 項目進捗表 + 自動確認結果 + かず向け手動確認手順 + 発見された問題を集約
  - **自動確認**(localhost:3000、Claude Code 実施):
    - `next build` ✅(2.1s でコンパイル成功、TypeScript 1.4s クリア)
    - 全 6 レッスンページ HTTP 200 + 主要文言検出(L1-L5 で 5 ボタン揃い、L6 で recap 専用文言揃い、L5 のみ `sandbox="allow-scripts"`)
    - LocationBar 全レッスンで「1 周目 [全体像]」+ 4 役割凡例描画
    - `/api/chat` 全 8 タイプ(judge/hint/praise/question/explain/improve/diagnose/summary)200 + 期待 JSON
    - `/api/log` Origin 正常時 200、未指定 / 偽 origin 403(Group 3 round 3 で導入したスキームパリティチェックが期待通り動作)
    - `/api/log` 書き込み → `/api/report/{sid}` 読み出しで `completedSteps` が反映される end-to-end 確認
    - 3 点セット 18 件存在 + `classifyEffort` 閾値が仕様通り(perfect=`maxTries<=1 && totalHints===0` / struggled=`<=3 && <=1` / persevered=else)
    - TODO_PHASE3.md(21 タスク × 82 件の対応要件参照)+ PHASE3_REQUIREMENTS_CHECK.md(T1-T19 + 判断済み事項)構造確認
  - **手動確認手順**(かず実施待ち):B-1 通し体験 / B-2 5 ボタン / B-3 3 点セット 3 種分岐 / B-4 LocationBar / B-5 課金導線 / B-6 既存回帰 — それぞれチェックボックス形式
- 自動確認で見つかった問題:
  - **C-1 Vercel デプロイは Phase 3.1 反映前**:`https://spark-code-mu.vercel.app/lesson/1` は MVP 版で 5 ボタンなし、`/lesson/2-6` は 404。手動確認は **localhost** で実施するか、`git push origin main` で Vercel 自動ビルドを走らせる必要あり。Claude Code は本番デプロイを user 確認なしには行わない
  - C-2 ローカル dev に対する自動確認では問題なし
- 主な変更ファイル: `docs/T20_CHECKLIST.md`(新規)
- 要件定義書との差分: **なし**
- 自己評価: **OK(自動確認部分)/ 手動確認待ち**(§18.1 #5/#6/#8/#9 は自動確認で確定。#1/#2/#3/#4/#7 はかず手動確認後に最終判定。#10 は T21 で実施)

---

## グループ 4(T14-T18)判断済み事項

Codex Review を 3 ラウンド回した結果、2 件の warning は **仕様解釈と UX 方針に基づく意図的判断** として確定した(各ラウンドで Codex の判断自体が振動したため、4 ラウンド目を回しても収束する見込みが薄いと判断)。**要件適合の範囲内** であり、未解決の不具合ではない。Phase 3.1 検証で実問題が出た場合のみ再検討する。

### 判断 1: Hint カウントを intent 時点で行う

- **採用判断**: クリック直後(intent 時点)でカウント。API レスポンス成否に依存させない
- **代替案(Codex 提案)**: response 成功時のみカウント
- **根拠**: §9.6「ヒント使用回数 / リトライ回数」は **学習者が助けを求めた回数(struggle signal)** を意味する仕様解釈。生成失敗は学習者の体験には現れない事象であり、struggle 信号としては成立済み。Anthropic 可用性が十分高い前提で、失敗カウントによる誤差は小さな定数。逆に成功時のみカウントすると、本物の struggle が under-count されるリスクの方が大きい
- **justification コメント**: [components/LessonWorkspace.tsx:295-309](components/LessonWorkspace.tsx#L295-L309)(`handleHint` 内 — hint ボタン本体は [ChatPanel.tsx](components/ChatPanel.tsx) の `QuickActions` 内、カウンタ実体は親ハンドラに集約)
- **再検討トリガー**: Phase 3.1 検証で「3 点セットの effort 分類が学習者の体感とズレている」というフィードバックが出たとき

### 判断 2: Summary ボタンの disabled 状態を撤廃 + aria-live エラーバブル

- **採用判断**: ボタンは常に有効。`log.sessionId` が空の環境(プライベートモード等)では押下時にチャット内 `aria-live="polite"` バブルで理由をフィードバック
- **代替案(Codex 提案)**: `disabled` + `aria-describedby` の補助テキスト
- **根拠**: a11y 観点で `disabled` 状態の `<button>` は多くの screen reader でフォーカスを受けないため `aria-describedby` の説明文が読み上げられない。エラーバブルなら **sighted / keyboard / touch / AT 全ユーザーに同じ体験**(既存の chat aria-live チャンネル経由)。storage-blocked はレアケースで、たまの 1 往復よりも全員に届くフィードバックを優先
- **justification コメント**: [components/ChatPanel.tsx:212-215](components/ChatPanel.tsx#L212-L215)(button 直前のコメント)+ [components/LessonWorkspace.tsx:459-475](components/LessonWorkspace.tsx#L459-L475)(`handleSummary` 内のエラーバブル emit)
- **再検討トリガー**: Phase 3.1 検証で「ボタンを押しても何も起きないように見える」「エラーメッセージが見つからない」というフィードバックが出たとき

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
