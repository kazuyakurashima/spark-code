# TODO_PHASE3.md

> Phase 3.1 のみ対象。Phase 3.2 以降は末尾に「将来 TODO」として記録するのみで、本リストでは実装着手しない。
> 各タスクは 30〜90 分粒度(Claude Code 実装 10〜30 分 + かずレビュー 10〜30 分 + 修正 10〜30 分)。
> 1 タスク完了ごとに [docs/PHASE3_REQUIREMENTS_CHECK.md](PHASE3_REQUIREMENTS_CHECK.md) を更新する。

---

## グループ A: 基盤(レッスンデータ + プレビュー)

### T1: lessons.ts のデータモデル拡張(3 周構造 / 課金境界 / プレビュー設定)

- 対応要件: §4 / §5.1 / §5.3 / §6 / §10.3 / §10.4
- 目的: 16 レッスン × 3 周 + 無料/有料境界 + Lesson 4 / 5 で必要になる **CSS / JS の挿入位置切替** をデータ層で扱えるようにする(Phase 3.1 では実データは Lesson 1〜6 のみ)
- 変更予定ファイル:
  - [lib/lessons.ts](../lib/lessons.ts)(型 + データ)
  - [lib/lessons-server.ts](../lib/lessons-server.ts)(matchStep / getSolution の Lesson 2〜6 対応はここでは型互換のみ確保)
  - [types/supabase.ts](../types/supabase.ts)(参照のみ、変更不要)
- 完了条件:
  - `Lesson` 型に `round: 1 | 2 | 3` / `paid: boolean` / `concept: string`(主要概念)/ `previewMode: "html" | "html+css" | "html+css+js"` / `scaffold: { html?, css?, js? }`(お膳立て)を追加
  - `LessonStep` に `solutionPattern`(正規表現/関数 source-of-truth)を server 側で持つ余地を残す(public 側にデータは漏らさない)
  - 型変更で既存 Lesson 1 が壊れない(`previewMode` 既定値の後方互換)
  - tsc / lint クリーン
- 要件適合チェック:
  - [ ] 1 レッスン 1 新概念(§3.1)が `concept` で表現できる
  - [ ] 課金境界(§5.3)が `paid` で表現できる
  - [ ] 1 周目で登場した要素を 2/3 周目で再訪する設計(§4.2 / §5.2)に必要なメタが揃う
  - [ ] 既存 Lesson 1 の動作が壊れない
- 想定時間: 60 分

### T2: Preview コンポーネントの動的設定対応(sandbox 切替 / scaffold 注入)

- 対応要件: §6 Lesson 4 / §6 Lesson 5 / §16.2(JS は 1 行のみ書かせる)
- 目的: Lesson 4 で `<style>` を許容、Lesson 5 で `<script>` を実行可能にする。お膳立ての HTML/CSS/JS をプレビュー側に注入し、学習者が書く範囲を最小化する
- 変更予定ファイル:
  - [components/Preview.tsx](../components/Preview.tsx)
  - [app/globals.css](../app/globals.css)(必要なら preview-iframe 周りの調整のみ)
- 完了条件:
  - `previewMode === "html+css+js"` のときだけ `sandbox="allow-scripts"` に切り替え、それ以外は今の素 `sandbox=""` を維持
  - `scaffold.html / scaffold.css / scaffold.js` を srcDoc 構築時にマージ
  - 学習者コードと scaffold の境界が `<!-- learner-code-begin -->` 等のコメントで識別可能
  - Lesson 1 の挙動が回帰していない(curl + grep で確認)
- 要件適合チェック:
  - [ ] §16.2「Lesson 5 では textContent 1 行に留める」をデータ + Preview で担保できる構造
  - [ ] §10.3「1 周目では CSS のお膳立てがあり、コードを書くと部分的にプレビューが変わる」を実現できる
  - [ ] sandbox の最小権限原則(Phase 1 の §12 #4)を維持(JS 必要時のみ allow-scripts)
- 想定時間: 60 分

---

## グループ B: Lesson 2〜6 コンテンツ + 判定

### T3: Lesson 2(自己紹介文 `<p>`)

- 対応要件: §5.1 #2 / §6 Lesson 2
- 目的: 名前だけでなく文章を追加してページらしくする小成功体験
- 変更予定ファイル:
  - [lib/lessons.ts](../lib/lessons.ts)(public データ追加)
  - [lib/lessons-server.ts](../lib/lessons-server.ts)(matchStep + solution 追加)
- 完了条件:
  - Lesson 2 の overview / steps / instruction / hintDefault が定義
  - 判定: `<p>` タグが 1 つ以上あり、中身が trim 後 0 文字超
  - エッジケース 4 件以上を unit-level に書き出して挙動一致(`<p></p>` 不合格 / `<p>...</p>` 合格 / 全角空白のみ 不合格 / 改行混在 合格)
  - Lesson 1 → Lesson 2 へ手動遷移できる(現時点で Lesson 切替 UI なしでも、URL 直叩き `/lesson/2` で表示)
- 要件適合チェック:
  - [ ] 1 レッスン 1 新概念(§3.1): `<p>` のみ
  - [ ] 1 小成功(§3.2): 自己紹介文が画面に出る
  - [ ] 1 見た目変化(§3.3): プレビューに 2 行目が追加される
  - [ ] 技術名より変化を先に出す説明文(§3.5)
- 想定時間: 45 分

### T4: Lesson 3(好きなものリスト `<ul><li>`)

- 対応要件: §5.1 #3 / §6 Lesson 3 / §5.2 行「好きなもの」
- 目的: 自分らしさを表現する要素を追加
- 変更予定ファイル: T3 と同じ 2 ファイル
- 完了条件:
  - 判定: `<ul>` 内に `<li>` が 2 つ以上、各 `<li>` の中身が空でない
  - エッジケース: `<ul>` 直下に `<li>` 1 つ → 不合格 / `<ul><li>a</li><li>b</li></ul>` → 合格 / `<ol>` 単独 → 不合格(`<ul>` 必須)
- 要件適合チェック:
  - [ ] §3.1〜§3.5 を満たす(新概念 = `<ul>/<li>` のリスト構造)
  - [ ] 2 周目 Lesson 9 で「タグ風装飾」に進化させる前提(§5.2)で、HTML 構造が単純で再利用可能
- 想定時間: 45 分

### T5: Lesson 4(色を変える、`<style>` 導入)

- 対応要件: §5.1 #4 / §6 Lesson 4 / §3.5(技術名より変化を先に)
- 目的: CSS を「見た目を変えるもの」として体験で導入
- 変更予定ファイル:
  - [lib/lessons.ts](../lib/lessons.ts)(`previewMode: "html+css"`、`scaffold.css` で初期 `h1 { color: black; }` を提供しない:学習者が `<style>` を書くフロー)
  - [lib/lessons-server.ts](../lib/lessons-server.ts)
- 完了条件:
  - 判定: `<style>` 内に `color:` プロパティがあり、`black` / `#000` / `#000000` 以外の色値である
  - 説明文では `color` プロパティ名より「文字色を変える」を先に出す(§3.5)
- 要件適合チェック:
  - [ ] §3.5: 「`color` を学ぶ」より「色を変える」が先
  - [ ] T2 Preview の `<style>` 取り込みが効いている(プレビュー反映)
  - [ ] Lesson 5 の `<style>` 残存が想定通り(scaffold or 学習者持ち越しのどちらかを設計上明示)
- 想定時間: 75 分(Preview とのつなぎが多い)
- 備考: scaffold で `<style>` 自体は学習者に書かせる方針を採用予定。code エディタには空のテンプレを置き、`<style>` の最小例を instruction で示す

### T6: Lesson 5(1 行 JS 体験)

- 対応要件: §5.1 #5 / §6 Lesson 5 / §16.2(1 行に留める)
- 目的: JS によって画面が変わる体験を、最小負荷で
- 変更予定ファイル:
  - [lib/lessons.ts](../lib/lessons.ts)(`previewMode: "html+css+js"`、`scaffold.js` に `const name = document.querySelector("#name");` を入れる)
  - [lib/lessons-server.ts](../lib/lessons-server.ts)
  - [components/CodeEditor.tsx](../components/CodeEditor.tsx)(必要なら言語切替 — Lesson 5 は HTML+CSS+JS の混在 or `<script>` を学習者に書かせる方式 — どちらにするかは備考の判断ポイントで決定)
- 完了条件:
  - 判定: `name.textContent = "..."` 形式の代入が 1 行存在(`addEventListener` / `querySelector` / `value` を含むコードは推奨外として、判定上は通すが Sparkコーチが「まだ書かなくて OK」と返すヒント設計)
  - お膳立て JS がプレビュー実行時に同一スコープで動く
  - Sparkコーチからの予告(§6 Lesson 5 末尾「3 周目で自分で書けるようになります」)が 3 点セットに含まれる(T15 と連動)
- 要件適合チェック:
  - [ ] §16.2: textContent 1 行に留まる
  - [ ] §6 Lesson 5: `addEventListener` 等を学習者に書かせていない
  - [ ] sandbox は allow-scripts 限定で発動
- 想定時間: 90 分(MVP の中で最も実装が新規。判断点多め)
- 備考(判断点): 学習者は `<script>` タグごと書く / お膳立て側で `<script>` を持ち scaffold で 1 行だけ inject する、の 2 案。後者を採用予定。理由:`<script>` の構文ノイズを避けて純粋に textContent 代入だけに集中させるため

### T7: Lesson 6(1 周目クリア + 総合振り返り)

- 対応要件: §5.1 #6 / §6 Lesson 6 / §11.1 / §11.4(課金前メッセージへの接続)
- 目的: 1 周目達成感 + 課金導線への自然な接続
- 変更予定ファイル:
  - [lib/lessons.ts](../lib/lessons.ts)(Lesson 6 はコードを書かせない「祭り」レッスン)
  - 新規: [components/Lesson6Recap.tsx](../components/Lesson6Recap.tsx)(振り返り画面 — Lesson 1ClearReport の上位互換的位置付け)
  - [components/LessonWorkspace.tsx](../components/LessonWorkspace.tsx)(Lesson 6 のときだけ Lesson6Recap を 3 ペインの中央 or 全幅で出す分岐)
- 完了条件:
  - Lesson 6 では code エディタを非表示にして、Recap 画面 + Sparkコーチパネルのみ表示
  - 5 つの要素(名前/自己紹介/リスト/色/動き)を周回振り返り
  - HTML / CSS / JS / Sparkコーチの全体像表(§5.2 を抜粋)
  - Sparkコーチ総合振り返り(§6 Lesson 6 例文 + 苦労度合いで 2-3 種テンプレ — T15 連動)
  - 「未来のカード」プレビュー枠(T18 と連動)
  - 「SparkPlus でカードを育てる」ボタン(T17 連動、押下時は Phase 3.2 placeholder メッセージ)
- 要件適合チェック:
  - [ ] §3.1〜3.5 を逸脱しない(新コード書かせない = 1 新概念ゼロでも OK と要件で許容)
  - [ ] §11.4 の課金前メッセージにスムーズにつながる
  - [ ] §17.1 検証問い 4「続きをやりたいか」を引き出す UI 強度
- 想定時間: 90 分

---

## グループ C: レイアウト

### T8: 現在地表示バー

- 対応要件: §10.1 / §10.2
- 目的: 初心者が迷子にならないよう、画面上部に「今どこ / 全体像」を常時提示
- 変更予定ファイル:
  - 新規: [components/LocationBar.tsx](../components/LocationBar.tsx)
  - [components/ThreePaneLayout.tsx](../components/ThreePaneLayout.tsx)(grid を `auto 1fr` に変えて上部に LocationBar を載せる)
  - [app/lesson/[id]/page.tsx](../app/lesson/[id]/page.tsx)(または LessonWorkspace 内)で LocationBar を ThreePaneLayout に top として渡す
- 完了条件:
  - 上段: `1周目 [全体像] >> 2周目 [整える] >> 3周目 [動かす]`、現在の周がハイライト
  - 中段: `Lesson X / 16:<title>`
  - 下段: `HTML=中身 / CSS=見た目 / JS=動き / Sparkコーチ=先生` の凡例
  - 60 代対応として **下段凡例は文字サイズ 13px+ で hover/tooltip でも意味が出る**(§17.2 の予防)
- 要件適合チェック:
  - [ ] §10.2 の表示要素 3 段すべて
  - [ ] §4.1 の 3 周構造が一目で見える
  - [ ] 既存 3 ペインを壊さない(ThreePaneLayout の API 変更だけで済ませる)
- 想定時間: 75 分

---

## グループ D: Sparkコーチ — API & プロンプト

### T9: 既存プロンプト 4 種を §9.7 準拠に改修(judge / hint / praise / question)

- 対応要件: §9.5 / §9.7.1 / §9.7.2 / §9.7.3 / §9.7.4
- 目的: 既存実装(Phase 1〜2 で書いた lib/prompts.ts)のトーンを §9.5「Sparkコーチの返答トーン」に揃える
- 変更予定ファイル:
  - [lib/prompts.ts](../lib/prompts.ts)
- 完了条件:
  - 共通トーン文字列に「技術名を使うときは必ず意味を添える(例: `<h1>`(見出しタグ))」を追加
  - 各プロンプトに「悪い: `間違っています`、良い: `惜しいです`」のスタイル指示
  - judge プロンプトの user template に **`expected_pattern`(server-side のみ)を含める**(§9.7.2 準拠、Lesson 単位で渡せるように引数追加)
  - praise / hint / question の 3 〜 5 行制約を明記
  - tsc / lint クリーン、Lesson 1 の動作が回帰しない(curl で挙動確認)
- 要件適合チェック:
  - [ ] §9.5 の 6 トーン(優しい / 短すぎず / 具体的 / 何を直すか / 認める / 技術名注釈)を全プロンプトに反映
  - [ ] §9.7 系の「返答ルール」を逸脱しない
- 想定時間: 60 分

### T10: 「やさしく説明して」(`type=explain`)新規エンドポイント

- 対応要件: §9.2 先生 / §9.3「やさしく説明して」/ §9.7.1
- 目的: 現在のレッスンの主要概念を 3-5 行で説明する独立フロー
- 変更予定ファイル:
  - [types/chat.ts](../types/chat.ts)(`ChatRequest` に `explain` バリアント追加)
  - [lib/prompts.ts](../lib/prompts.ts)(`buildExplainPrompt`)
  - [app/api/chat/route.ts](../app/api/chat/route.ts)(分岐追加)
- 完了条件:
  - リクエスト: `{type: "explain", stepId, code}`
  - 内部で `concept`(T1 で追加した lesson メタ)を user template に流す
  - レスポンス: `ChatResponseTextual { type: "explain", message }`
  - 200/400/500 の typed JSON が既存と整合
- 要件適合チェック:
  - [ ] §9.7.1: 3-5 行 / 技術名注釈 / 例 1 つ / 今のコードに紐づけ
- 想定時間: 45 分

### T11: 「もっと良くしたい」(`type=improve`)新規エンドポイント

- 対応要件: §9.2 ナビゲーター(改善版)/ §9.3「もっと良くしたい」/ §9.7.5
- 目的: 現在のコードを認めつつ、次のレッスンで実現できる 1 つの提案を予告
- 変更予定ファイル: T10 と同じ 3 ファイル
- 完了条件:
  - 内部で `next_lesson_title`(現 lesson + 1 のタイトル)を user template に流す
  - 「具体的なコードは示さない、予告だけ」をプロンプトに明記
  - Lesson 6(最終)では「2 周目で実現できること」に置換
- 要件適合チェック:
  - [ ] §9.7.5 の返答ルール 3 点
  - [ ] 課金導線(§11.3)とトーンが整合(技術ではなく作品成長を訴求)
- 想定時間: 45 分

### T12: 「できたことを教えて」(`type=summary`)新規エンドポイント

- 対応要件: §9.2 応援者 / §9.3「できたことを教えて」/ §9.7.3
- 目的: learning_events 直近 20 件から 3 つの「できるようになったこと」を AI で抽出
- 変更予定ファイル:
  - [types/chat.ts](../types/chat.ts)(`{type: "summary", stepId}`、code は不要)
  - [lib/prompts.ts](../lib/prompts.ts)(`buildSummaryPrompt`)
  - [app/api/chat/route.ts](../app/api/chat/route.ts)(supabase-server 経由で sessionId(=cookie or header 経由) → learning_events fetch)
  - **検討**: sessionId をどう route に渡すか — 現状 `/api/chat` は sessionId を受け取らない。リクエストボディに `sessionId` を追加するか、cookie に保存するか。MVP は body 追加が単純
- 完了条件:
  - body 経由で `sessionId` を受け取り、learning_events から直近 20 件 select
  - 3 件箇条書き + 励まし 1 行を返す
  - sessionId が無効/見つからない場合は「これからの記録から 3 つお返しします」のフォールバック
- 要件適合チェック:
  - [ ] §9.7.3: 3 つ箇条書き / 過去形 / 最後に 1 行励まし
  - [ ] sessionId の漏洩経路がない(body のみ、cookie 化はしない)
- 想定時間: 75 分

### T13: 「どこが違う?」(judge 改良版、`type=diagnose`)プロンプト + UI 経路

- 対応要件: §9.2 コード診断 / §9.3「どこが違う?」/ §9.7.2
- 目的: メイン CTA「答え合わせする」(進行あり)とは別に、**進行を起こさず差分指摘だけ返す**コード診断ボタンを Sparkコーチパネル側に持つ
- 変更予定ファイル:
  - [types/chat.ts](../types/chat.ts)(`{type: "diagnose", stepId, code}`)
  - [lib/prompts.ts](../lib/prompts.ts)(`buildDiagnosePrompt` — judge プロンプトの差分指摘版)
  - [app/api/chat/route.ts](../app/api/chat/route.ts)
- 完了条件:
  - レスポンス: `{type: "diagnose", message}`(correct フィールドは持たない、進行と無関係であることを型で示す)
  - `matchStep` で先に regex 一次判定し、合格していたら「いまのコードは合格パターンに合っています!`答え合わせする`を押すと進めます」と返す(進行は学習者の手で)
  - 不合格なら差分 1 か所のみ指摘、修正例 1 行
- 要件適合チェック:
  - [ ] §9.3「差分を 1 か所だけ指摘」を実装で担保(プロンプト + 結果のレビュー)
  - [ ] §3.2 / §16.1 のスモールステップ精神(進行は別 CTA)を保つ
- 想定時間: 60 分
- 備考(判断点): 進行を起こすか起こさないかは要件定義書で明示なし。**進行なしを採用**(§9.3 の動作文「比較し、差分を 1 か所だけ指摘」に「進行する」が無いため)

---

## グループ E: Sparkコーチ — UI

### T14: ChatPanel に常設ボタン 5 つを統合 + レッスン切替時の履歴クリア

- 対応要件: §9.3 / §10.5 / §10.4(エラー時の自動誘導は §9.8 と一緒に Phase 3.2 へ)
- 目的: 5 つの機能ボタンを目立つ位置に配置し、自由入力欄はその下に
- 変更予定ファイル:
  - [components/ChatPanel.tsx](../components/ChatPanel.tsx)(2 行 × 3 列 grid + 5 つ目を full-width、または 5 個横並びアイコン化、MVP は 2x3 を採用)
  - [components/LessonWorkspace.tsx](../components/LessonWorkspace.tsx)(各ボタンに対応する `handleExplain` / `handleImprove` / `handleSummary` / `handleDiagnose` を配線、レッスン切替時に messages をクリア)
- 完了条件:
  - 5 ボタンが 1 画面に収まる(縦スクロール無し)
  - 各ボタンは busy 中グレーアウト(既存 isBusy 仕組みを再利用)
  - レッスン id 変更で `messages` が `[]` にリセット(`useEffect [lessonId]` 経由)
  - 自由入力欄(textarea + 送信)はボタン群の下に配置
- 要件適合チェック:
  - [ ] §9.3 の 5 ボタン仕様
  - [ ] §10.5 のメッセージ履歴をレッスン単位で保持(切替時クリア)
  - [ ] §10.5「常設ボタンを優先的に表示、自由入力欄はその下」(§9.4)
- 想定時間: 90 分

---

## グループ F: 3 点セット

### T15: 3 点セットのテンプレデータ作成(Lesson 1〜6 × 苦労度合い 3 種)

- 対応要件: §3.4 / §9.6
- 目的: AI を使わず、レッスン × 苦労度合いの組合せでテンプレ文を出せるようにする
- 変更予定ファイル:
  - 新規: [lib/three-point-templates.ts](../lib/three-point-templates.ts)(client-safe な定数データ。AI 不使用)
- 完了条件:
  - データ構造: `Record<lessonId, { perfect: ThreePoints; struggled: ThreePoints; persevered: ThreePoints }>`
  - `ThreePoints = { didLearn: string; cardEvolved: string; nextFun: string }`
  - 苦労度合いの分類関数 `classifyEffort({tries, hintCount}): "perfect" | "struggled" | "persevered"`
    - `perfect`: tries === 1 && hintCount === 0
    - `struggled`: tries <= 3 && hintCount <= 1
    - `persevered`: それ以外(tries >= 4 or hintCount >= 2)
  - Lesson 1〜6 全てで 3 種揃う(計 18 件)
- 要件適合チェック:
  - [ ] §3.4 の 3 点セット 3 項目を全件埋めている
  - [ ] §9.6「2-3 種類で切り替え」の閾値が明確
  - [ ] §3.5「技術名より変化」のトーンを守る
- 想定時間: 75 分(コピーライティングの量があるため)

### T16: 3 点セット自動表示 UI(レッスン完了時)

- 対応要件: §3.4 / §9.6 / §10.5「他メッセージと差別化」
- 目的: 合格判定の瞬間に 3 点セットをチャット欄に大きく差し込む
- 変更予定ファイル:
  - 新規: [components/ThreePointSet.tsx](../components/ThreePointSet.tsx)(専用バブル、紫→ピンクのグラデ + 3 段縦並び + アイコン)
  - [components/ChatPanel.tsx](../components/ChatPanel.tsx)(`kind: "three-points"` を追加してレンダー分岐)
  - [types/chat.ts](../types/chat.ts)(`ChatMessage["kind"]` に "three-points" 追加 + `payload` フィールド)
  - [components/LessonWorkspace.tsx](../components/LessonWorkspace.tsx)(handleJudge correct=true 時に classify → templates から 3 点を取って append)
- 完了条件:
  - 合格時、judge バブル → 3 点セットバブル → praise バブル の順で表示
  - 3 点セットは他のバブルより明確に大きく / 装飾されている
  - レッスン id 変更で消える(T14 の clear と整合)
- 要件適合チェック:
  - [ ] §10.5「3 点セットを大きく表示、他のメッセージと差別化」
  - [ ] §9.6「テンプレで切替、AI 不使用」
- 想定時間: 60 分

---

## グループ G: 課金導線 UI(Phase 3.1 範囲)

### T17: Lesson 6 完了後の課金前メッセージ + CTA ボタン 2 つ(UI のみ)

- 対応要件: §11.4 / §11.5 / §13.5(Stripe 不可)
- 目的: 課金導線の入口 UI。Stripe 接続は Phase 3.2、ここでは静的画面 + placeholder クリック
- 変更予定ファイル:
  - 新規: [components/UpsellBlock.tsx](../components/UpsellBlock.tsx)
  - [components/Lesson6Recap.tsx](../components/Lesson6Recap.tsx)(T7 で作成、ここで UpsellBlock を embed)
- 完了条件:
  - §11.4 の文面をそのまま embed
  - 主ボタン「SparkPlus でカードを育てる(早期応援 月 498 円)」 / 副ボタン「後で考える」
  - クリック動作: 主ボタン → トースト/モーダルで「Phase 3.2 で公開予定です。検証フィードバックをお待ちしています」 / 副ボタンは Lesson 6 画面に留まる
  - `// TODO Phase 3.2: Stripe Checkout` コメントを主ボタン onClick に明記
- 要件適合チェック:
  - [ ] §11.3「技術ではなく伴走 + 作品成長で訴求」を文面で守る
  - [ ] §11.5 の推奨ボタン文言 / 避けたい文言を遵守
  - [ ] §13.5「Stripe 決済の本格実装は禁止」
- 想定時間: 60 分

### T18: 未来プレビュー UI(現在のカード vs 完成形)

- 対応要件: §11.6 / §6 Lesson 6「未来のカード」プレビュー
- 目的: 「ここから先は何ができるか」を視覚で見せて課金訴求の核にする
- 変更予定ファイル:
  - 新規: [components/FuturePreview.tsx](../components/FuturePreview.tsx)
  - [components/Lesson6Recap.tsx](../components/Lesson6Recap.tsx)(embed)
  - 静的アセット or 内部 srcDoc 2 枚(現在 = 1 周目で書いたカード状態 / 完成形 = ハードコードされた完成例 HTML)
- 完了条件:
  - 左: 学習者の現コードを sandbox プレビューで表示(Phase 2 の Preview component を流用、サムネイルサイズ)
  - 右: 完成形(角丸 + 影 + テーマ色 + hover インタラクションのスタティックスナップショット — Phase 3.1 では gif/動画ではなく静的)
  - 矢印 + 「SparkPlus でここに到達」キャプション
  - レスポンシブで縦並びにフォールバック(将来モバイル対応の布石)
- 要件適合チェック:
  - [ ] §11.6 のレイアウト(現在 → 未来 + 矢印 + キャプション)
  - [ ] §1.3「自分のカードが少しずつ育つ感覚」を視覚化
- 想定時間: 75 分

---

## グループ H: ドキュメント整備

### T19: 関連ドキュメント整備(PROJECT_OVERVIEW Status / CURRICULUM 抜粋 / SPARK_COACH 抜粋)

- 対応要件: §0.4 / §19.3
- 目的: 実装中・レビュー中に参照できるよう、要件定義書を分割した子ドキュメントを置く
- 変更予定ファイル:
  - [docs/PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)(Status を「Phase 3.1 着手」に更新)
  - 新規: [docs/CURRICULUM.md](CURRICULUM.md)(§5-§8 を抜粋、ただし PHASE3_REQUIREMENTS.md からの転載 + 「正本は PHASE3_REQUIREMENTS.md」と明記)
  - 新規: [docs/SPARK_COACH.md](SPARK_COACH.md)(§9 を抜粋、同様の注記)
- 完了条件:
  - 3 ファイルが存在し、リンクが docs/PHASE3_REQUIREMENTS.md と双方向にある
  - PROJECT_OVERVIEW.md の §11/§13/§14 等は Phase 3 開始前の状態のまま温存し、Status 行のみ更新
- 要件適合チェック:
  - [ ] §0.4 の関連ドキュメント 4 種が揃う
  - [ ] §19.3 の分割が機能する
- 想定時間: 45 分

---

## グループ I: 仕上げ・検証

### T20: Phase 3.1 通し動作テスト(全 6 レッスン × 全ボタン × 課金導線)

- 対応要件: §18.1
- 目的: §18.1 の完了条件 10 項目を一つずつ確認
- 変更予定ファイル:
  - 新規: [docs/PHASE3_1_SMOKE.md](PHASE3_1_SMOKE.md)(チェックリスト + 結果)
  - 必要に応じてバグ修正の追コミット
- 完了条件:
  - Lesson 1→2→3→4→5→6 を session 1 つで完走できる
  - 各レッスンで Sparkコーチ 5 ボタン全部が 200 + 妥当な内容を返す
  - 各レッスン完了時に 3 点セットが表示される
  - Lesson 6 後に課金導線 + 未来プレビューが見える
  - learning_events に各イベントが入っている(MCP execute_sql で件数確認)
  - DevTools Network で `ANTHROPIC_API_KEY` / `SUPABASE_SERVICE_ROLE_KEY` の漏洩なし
- 要件適合チェック:
  - [ ] §18.1 の 10 項目すべて
- 想定時間: 90 分

### T21: Codex Review × 必要ラウンドで APPROVED

- 対応要件: §18.1「Codex Review で APPROVED を得る」/ §13.7
- 目的: 第三者視点で Phase 3.1 の品質をクリア
- 変更予定ファイル: review 指摘により該当ファイル(都度)
- 完了条件:
  - `bash scripts/codex-review.sh 1` から開始
  - Round 3 までに APPROVED、または fresh round で APPROVED
  - 修正コミットを `fix(review): ...` 形式で残す
- 要件適合チェック:
  - [ ] APPROVED が `.codex-review.json` に記録される
- 想定時間: 90 分(レビュー + 修正の合計)

---

## サマリ

| グループ | タスク数 | 合計想定時間 |
|---|---|---|
| A. 基盤 | 2 | 120 分 |
| B. Lesson 2〜6 | 5 | 345 分 |
| C. レイアウト | 1 | 75 分 |
| D. Sparkコーチ API | 5 | 285 分 |
| E. Sparkコーチ UI | 1 | 90 分 |
| F. 3 点セット | 2 | 135 分 |
| G. 課金導線 UI | 2 | 135 分 |
| H. ドキュメント | 1 | 45 分 |
| I. 仕上げ | 2 | 180 分 |
| **合計** | **21** | **1,410 分(約 23.5 時間)** |

実装速度はかずレビュー前提で見積もり。検証 5 名のレビュー前に Phase 3.1 を着地させる前提で、教室業務の合間で 2-3 週間が現実線。

---

## 暗黙の判断ポイント(質問せず採用、必要なら指摘してください)

1. **苦労度合いの閾値**(T15): `perfect: tries=1 && hint=0` / `struggled: tries<=3 && hint<=1` / `persevered: それ以外`
2. **常設ボタン配置**(T14): 2x3 グリッド + 5 個目は full-width、検証後に再調整
3. **「どこが違う?」の進行扱い**(T13): 進行なし(差分指摘のみ)
4. **Lesson 5 の `<script>` 構文**(T6): 学習者には書かせない、scaffold で `<script>` を持つ
5. **課金 CTA 主ボタンクリック動作**(T17): Phase 3.2 placeholder メッセージを表示

これらは要件定義書 §13.5 末尾の「軽微な実装判断」に近く、独断で採用しています。違っていたら個別 TODO を更新します。

---

## Phase 3.2 以降の将来 TODO(Phase 3.1 では着手しない)

- §9.8 学習者状態応答(3 回失敗で「どこが違う?」誘導 / 5 分無変更でヒント提案 / 連続正解で褒め / 1 周目クリアで Lesson 6 自動遷移)
- §10.4 エラー時の Sparkコーチへの自動誘導
- Lesson 7〜11(Phase 3.3)
- Lesson 12〜16(Phase 3.4)
- Stripe 決済(Phase 3.2)
- 認証システム(Phase 3.2)
- user_code テーブル + コード保存(Phase 3.2)
- 公開 URL(Phase 3.4)
