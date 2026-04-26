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
