# SparkCode — プロジェクト概要

> **Status**: **Phase 3.1 実装完了・検証中**(Lesson 1-6 / 1 周目通し動作 / Sparkコーチ 4 役割 + 5 ボタン + 3 点セット + Lesson 6 課金導線 UI まで実装済。**T20 手動確認 + T21 Codex Review APPROVED 後に「Phase 3.1 完了」へ確定**。Codex Review Phase 1-3 通算 12 ラウンドで APPROVED 累積、Phase 3.1 グループ 4 は判断済み事項 2 件を保持)/ Phase 3.2(課金本実装)着手前
> **最終更新**: 2026-04-27

---

## 関連ドキュメント

| ドキュメント | 役割 |
|---|---|
| 本書(PROJECT_OVERVIEW.md) | 全体概観 / Phase 進捗 / 技術スタック / ハマりポイント |
| [PHASE3_REQUIREMENTS.md](PHASE3_REQUIREMENTS.md) | Phase 3 要件定義書(**正本**)|
| [CURRICULUM.md](CURRICULUM.md) | 全 16 レッスン詳細(§5-§8 抜粋)+ Phase 3.1 実装状況 |
| [SPARK_COACH.md](SPARK_COACH.md) | Sparkコーチ仕様(§9 抜粋)+ Phase 3.1 実装マップ |
| [TODO_PHASE3.md](TODO_PHASE3.md) | Phase 3.1 タスク管理(T1-T21)|
| [PHASE3_REQUIREMENTS_CHECK.md](PHASE3_REQUIREMENTS_CHECK.md) | 各タスク完了時の要件適合チェック(§13.4)|
| [DEPLOY.md](DEPLOY.md) | デプロイ手順(Vercel)|

---

## 1. このサービスは何か

**SparkCode** は、プログラミング完全初心者のための HTML/CSS 学習 Web サービスです。

コンセプトは **「見た目ワクワク × 裏で基本ガッツリ」**。
学習者は、最終的に「動く自己紹介カード」(ホバーで浮き上がる・グラデーション背景・モダンなデザイン)を自力で作れるようになります。
使う技術は **基本タグと CSS の基礎だけ**。背後ではちゃんと基礎を叩き込む、表層の「楽しい」を最重要視する設計です。

### なぜ作るか

既存サービス(Progate など)は学習内容は良いが、見た目が地味で初心者の「作ってる感」が弱い。
SparkCode は **「書いた瞬間に綺麗な何かが画面に出る」体験** を最初の 30 秒で届けることを目標にしています。
プレビューには最初から CSS でお膳立てされた舞台が用意されていて、学習者が `<h1>` を 1 行書くだけで「お、綺麗!」となる。

---

## 2. Phase 進捗(本書の現在地)

SparkCode は段階的に育てる前提で設計されており、各 Phase ごとに完了条件を明確にしている。

| Phase | スコープ | 状態 |
|---|---|---|
| **Phase 1**(MVP コア) | 3 ペイン UI + Lesson 1 + プレビュー + コードエディタ | ✅ 完了(Codex 3 ラウンド APPROVED)|
| **Phase 2**(MVP 仕上げ) | AI 結線(judge/hint/praise/question)+ Lesson 1 通し + エラーハンドリング | ✅ 完了(Codex 3 ラウンド APPROVED)|
| **Phase 2.5**(基盤) | Supabase 結線 + `learning_events` + 進捗保存 | ✅ 完了 |
| **Phase 3.1**(1 周目) | Lesson 1-6 + Sparkコーチ 4 役割 + 5 ボタン + 3 点セット + 課金 UI | 🟡 **実装完了・検証中**(T20 手動確認 + T21 Codex Review APPROVED で確定)|
| Phase 3.2 | 課金本実装(Stripe)+ 認証 + §9.8 promotive 誘導 | ⏳ 未着手 |
| Phase 3.3 | Lesson 7-11(2 周目)| ⏳ 未着手 |
| Phase 3.4 | Lesson 12-16(3 周目)+ 共有 URL | ⏳ 未着手 |

### Phase 3.1 で実装が完了している範囲(検証中、2026-04 時点)

- **6 レッスン通し動作**:Lesson 1 (h1) → 2 (p) → 3 (ul/li) → 4 (CSS color) → 5 (1 行 JS / textContent) → 6 (recap + 課金導線 UI)
- **Sparkコーチ常設 5 ボタン**:ヒント / どこが違う? / やさしく説明して / できたことを教えて / もっと良くしたい(2x3 グリッド + full-width)
- **3 点セット 18 件テンプレ**:Lesson 1-6 × `perfect/struggled/persevered`、`classifyEffort` で自動切替
- **判定の二段構え**:正規表現が一次(source of truth)、Claude が二次追認
- **JS レッスン対応**:Lesson 5 のみ `sandbox="allow-scripts"`、他は `sandbox=""`(最小権限)
- **進捗保存**:Supabase `learning_events` テーブル(RLS)、service_role server-side / anon for `/api/log`、Origin チェック
- **課金導線 UI**:Lesson 6 後の UpsellBlock + FuturePreview(現在 vs 未来)。Stripe 結線は Phase 3.2 へ

詳しい実装は:[CURRICULUM.md](CURRICULUM.md)(レッスン)/ [SPARK_COACH.md](SPARK_COACH.md)(コーチ)/ [PHASE3_REQUIREMENTS_CHECK.md](PHASE3_REQUIREMENTS_CHECK.md)(タスク別自己評価)。

---

## 3. Phase 1/2 MVP のスコープ(歴史的記録)

> 以下は Phase 1-2 を完了した時点の記録。Phase 3 ではこの上に Lesson 2-6 と Sparkコーチ機能を積み増している。

**Lesson 1 が通しで動くこと** だけを目指す。認証・進捗保存・他レッスンは対象外。ローカル `npm run dev` で起動すれば OK。

### Lesson 1 の中身

テーマ: 「名前を画面に表示する」
学ぶのは `<h1>` タグの基本形だけ。

| Step | 内容 | 学ぶこと |
|------|------|---------|
| 1-1 | `<h1>名前</h1>` と書く | タグの基本形(開始タグ・中身・終了タグ) |
| 1-2 | `名前` を自分の名前に変える | コードと画面の対応を体感 |
| 1-3 | 完成 → Coming Soon 画面 | 次レッスンは未実装、予告だけ |

- 学習者が触るのは **HTML のみ**。CSS はプリセットで裏にあり、学習者は触らない(後のレッスンで学ぶ予告だけ表示)
- プレビューは最初から:
  - 薄いグラデーション背景(青紫 → ピンク系)
  - モダンなサンセリフ(Inter + system-ui フォールバック)
  - 中央寄せ、大きめサイズ

### Step 1-2 の判定仕様

**合格条件(3 つすべてを満たす)**:

1. `<h1>...</h1>` の構造が成立していること
2. タグ内テキストが**前後空白を除去した後**に `"名前"` 以外であること
3. タグ内テキストが空でないこと

**判定フロー**:

- **一次**: 正規表現で上記 3 条件をチェック。**これが source of truth**(合否を最終決定するのは正規表現)
- **二次**: 一次を通ったら Claude Haiku で「これは名前っぽい?」をゆるく追認
  - Claude が「名前っぽくない」と返しても **合格扱いは変えない**。そのメッセージだけ学習者に添えて表示する
  - 正規表現が不合格なら Claude は**呼ばない**(API コストとレイテンシを無駄にしない)

---

## 4. 画面構成(3 ペイン)

```
┌──────────────────┬─────────────────┬──────────────────────┐
│                  │                 │   プレビュー(上半分) │
│                  │                 │   iframe + srcdoc    │
│   レッスン説明    │   コードエディタ │                      │
│   (左 25%)      │   (中央 35%)   │  ────────────────────│
│                  │                 │                      │
│   Markdown       │   CodeMirror 6  │   AI チャット(下半分)│
│   Step ハイライト │   HTML 編集    │   ヒント/質問/褒め   │
│                  │                 │                      │
└──────────────────┴─────────────────┴──────────────────────┘
```

- **左ペイン (25%)**: レッスン説明を Markdown で表示。全体のステップを最初に見せて見通しを作り、現在のステップをハイライト
- **中央ペイン (35%)**: 学習者が HTML を書くコードエディタ
- **右ペイン (40%)**:
  - 上半分: iframe にコードをリアルタイム流し込み
  - 下半分: AI チャット(メッセージ入力欄と履歴)

---

## 5. AI の役割(MVP 時点 4 機能 → Phase 3.1 で 8 機能に拡張)

すべて **1 つの Route Handler** (`app/api/chat/route.ts`) で処理し、リクエストボディの `type` で分岐します。

| type | いつ発動 | 入力 | 出力 | 進行 |
|------|---------|------|------|---|
| **judge** | 「答え合わせする」CTA / lesson_completed 候補 | step / code / 模範解答 | `{ correct: boolean, message: string }` | 起こす |
| **hint** | 「ヒントがほしい」ボタン | step / code | 段階的ヒント(完成形は出さない) | 起こさない |
| **praise** | judge 正解後の追加 1 往復(best-effort) | step / code | コードに合わせた具体的な褒め | 起こさない |
| **question** | 自由質問欄から送信 | step / code / question | 初心者向け日本語解説 | 起こさない |
| **explain** | 「やさしく説明して」ボタン | lesson の主要概念 | 3-5 行の概念解説 | 起こさない |
| **improve** | 「もっと良くしたい」ボタン | code / 次レッスン名 | 良かった点 1 行 + 次レッスン予告 | 起こさない |
| **summary** | 「できたことを教えて」ボタン | sessionId(`learning_events` 集計)| 3 つの「できるようになったこと」 | 起こさない |
| **diagnose** | 「どこが違う?」ボタン | step / code | 差分を 1 か所だけ指摘 | **起こさない**(judge と区別)|

> Phase 3.1 で `praise` は `summary`(learning_events 集計版)に発展統合され、UI 上は「できたことを教えて」ボタンに集約。`judge` 内蔵の褒めメッセージは引き続き残る。

> ※ MVP では API に送るのは直近の質問 1 件のみ。UI 上は過去の Q&A を履歴として表示するが、API 側には履歴を送らない。履歴送信対応は Phase 2 の拡張(§15 参照)

### 共通のトーン(全機能)

- **日本語で返答**
- **20 年の指導経験を持つ優しい先生の口調**
- 初心者を**絶対に否定しない、まず褒める**
- 専門用語は最小限、使う時は必ず噛み砕く
- 「惜しい!」「よく気づいたね」「あと一歩!」のような温度感
- **3〜4 文以内、短く読みやすく**

### Judge の応答例

- 正解: `{ correct: true, message: "よく書けたね!`<h1>` は見出しを表すタグで…" }`
- 惜しい: `{ correct: false, message: "おしい!ここのスペースだけ消してみて" }`

### Praise は best-effort

**judge を正とし、praise は best-effort**。judge が `correct: true` を返した瞬間にステップ進行は確定する。praise はその後に追加で 1 往復走らせて具体的な褒め言葉を取りに行くが、**失敗・タイムアウト・レートリミットのいずれでもステップ進行は巻き戻さない**。

- 成功時: 取得した praise メッセージをチャット欄に表示
- 失敗時: UI にデフォルト文言(例: 「正解!その調子!」)を表示し、サーバーログに `console.warn` でエラー内容を残す

---

## 6. 技術スタック

| 領域 | 技術 | メモ |
|------|------|------|
| フレームワーク | **Next.js 16.2.4** (App Router) | AGENTS.md が警告する通りトレーニングデータ非互換あり。`node_modules/next/dist/docs/` を正本とする |
| 言語 | TypeScript 5 | セットアップ済み |
| React | 19.2.4 | セットアップ済み |
| スタイル | Tailwind CSS v4 | `@import "tailwindcss"` + `@theme inline`。`tailwind.config.js` は使わない |
| コードエディタ | **CodeMirror 6** (`@uiw/react-codemirror`) | HTML(`@codemirror/lang-html`)+ JavaScript(`@codemirror/lang-javascript` / Lesson 5 用)|
| プレビュー | `<iframe srcDoc={...} sandbox="" title="preview">` | プリセット CSS を srcdoc に埋め込み。**素の `sandbox`(値は空文字)で最小権限**。Lesson 5 のみ `sandbox="allow-scripts"` で 1 行 JS を許可 |
| AI | **Anthropic Claude Haiku 4.5** (`claude-haiku-4-5` エイリアス) | Route Handler 経由でサーバーサイドから呼ぶ。API キーはクライアントに絶対出さない |
| 永続化 | **Supabase**(`@supabase/supabase-js`) | `learning_events` テーブル(RLS)。anon クライアントから `/api/log`、service_role を `/api/chat` の summary / `/api/report` で利用 |
| CSRF 防御 | Origin スキーム + ホストパリティチェック | [lib/origin-check.ts](../lib/origin-check.ts) で `request.nextUrl.origin` と比較。Group 3 round 3 で scheme parity を追加 |
| 状態管理 | React `useState` + 軽量 Ref(`useEventLogger` フック)| 履歴は会話単位で localStorage に sessionId のみ保持。会話ログは Supabase 側 |
| Markdown 表示 | `react-markdown` + `remark-gfm` | レッスン説明 + 3 点セット内の技術名注釈レンダー |

### エディタ選定: なぜ CodeMirror 6 か

|  | Monaco Editor | **CodeMirror 6(採用)** |
|---|---|---|
| バンドル | 2–3MB | 約 300KB |
| 初心者向け | IntelliSense は逆に邪魔 | シンプル、機能は後から足せる |
| モバイル | △(IME で不具合報告多数) | ◯ |
| React 19 相性 | 要注意 | `@uiw/react-codemirror` が活発にメンテ |
| Lesson 1 要件 | 過剰 | ジャスト |

**決め手**: Lesson 1 のコードは数文字〜数十文字。初回ロードの軽さと手触りの良さを優先。拡張が必要になったら後からパッケージを足せる。

### Claude Haiku 4.5 を選ぶ理由

- 速度が最速・コストが最安($1/M in, $5/M out)
- Sonnet 4 相当の判定精度(2025-10-15 時点の Anthropic 公式アナウンス)
- 4 種の機能どれも 3〜4 文の応答で済むので、Haiku のスループットで十分
- 開発中の API コストが無視できるレベル(判定 1 往復 ≒ $0.001 未満)

> ℹ️ **時点情報の注意**: 上記は **2026 年 4 月時点** の情報。モデル ID とエイリアス挙動は Anthropic 側で変わり得るため、実装時に [docs.anthropic.com/en/docs/about-claude/models/overview](https://docs.anthropic.com/en/docs/about-claude/models/overview) で最新の model ID とエイリアス仕様を **必ず再確認** すること。エイリアス `claude-haiku-4-5` がなくなっていたら、当時の最新スナップショット ID に切り替える。

---

## 7. ファイル構成(Phase 3.1 実装完了時点)

```
app/
├── layout.tsx                Inter + Noto Sans JP、ダーク既定
├── page.tsx                  /lesson/1 へリダイレクト
├── globals.css               テーマトークン(@theme inline)+ keyframes(future-card-pulse 等)
├── lesson/[id]/page.tsx      3 ペイン or recap 画面切替(Client Component)
└── api/
    ├── chat/route.ts         POST、type で 8 種分岐(judge/hint/praise/question/explain/improve/summary/diagnose)
    ├── log/route.ts          POST learning_events(anon クライアントから JSON ログ受領)
    └── report/[sessionId]/   GET レポート集計(step_completed + lesson_completed 並列クエリ)

components/
├── ThreePaneLayout.tsx       左 25% / 中 35% / 右 40%
├── LessonPanel.tsx           Markdown 表示 + ステップハイライト + 「答え合わせする」CTA
├── CodeEditor.tsx            CodeMirror 6(HTML + JavaScript)
├── Preview.tsx               iframe + srcdoc。Lesson 5 のみ sandbox="allow-scripts"
├── ChatPanel.tsx             5 ボタン QuickActions(2x3+full)+ 履歴 + ThreePointsCard
├── LessonWorkspace.tsx       ペイン全体の state/orchestration(judge / hint / quick-actions ハンドラ集約)
├── LocationBar.tsx           現在地表示(Lesson n / m)
├── Lesson1ClearReport.tsx    Lesson 1 クリア時の集計レポート
├── Lesson6Recap.tsx          1 周目総合振り返り画面(recap kind 専用)
├── FuturePreview.tsx         現在カード vs 未来カード(2 iframe sandbox="")
└── UpsellBlock.tsx           §11.4 メッセージ + 主/副ボタン + placeholder notice

lib/
├── lessons.ts                public:Lesson 1-6 の overview / steps(match/solution は除外)
├── lessons-server.ts         server-only:正規表現 match と模範解答 solution(import "server-only")
├── prompts.ts                8 タイプの system/user プロンプト組立 + 共通トーン
├── anthropic.ts              "server-only" Anthropic SDK ラッパー
├── three-point-templates.ts  18 件 3 点セット + classifyEffort
├── supabase-client.ts        anon クライアント(/api/log 用)
├── supabase-server.ts        service_role(/api/chat の summary / report 用)
├── origin-check.ts           CSRF 防御(request.nextUrl.origin と対比)
└── use-event-logger.ts       useEventLogger フック(localStorage sessionId、step_started/completed 等)

types/
├── chat.ts                   ChatRequest / ChatResponse / ChatMessage(kind を 11 種に拡張)
├── report.ts                 レポート API のレスポンス型
└── supabase.ts               Database 型(supabase gen)

scripts/
├── codex-review.sh           Phase 完了時の AI レビューループ
└── review-schema.json        Codex 出力スキーマ

.env.local                    [gitignore] ANTHROPIC_API_KEY / SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
.env.local.example            [コミット対象] キー名のみ
```

---

## 8. 使うライブラリとインストールコマンド

```bash
npm install @anthropic-ai/sdk @uiw/react-codemirror @codemirror/lang-html @codemirror/theme-one-dark react-markdown remark-gfm server-only
```

| パッケージ | 用途 |
|---|---|
| `@anthropic-ai/sdk` | Route Handler から Claude API を呼ぶ公式 SDK |
| `@uiw/react-codemirror` | React 用 CodeMirror 6 ラッパー |
| `@codemirror/lang-html` | HTML シンタックスハイライト |
| `@codemirror/theme-one-dark` | ダーク配色 |
| `react-markdown` + `remark-gfm` | レッスン説明の Markdown 描画 |
| `server-only` | `lib/anthropic.ts` をクライアントに誤混入させない保険 |

Tailwind・TypeScript は既にセットアップ済みなので追加不要。

---

## 9. 環境変数

### `.env.local`(手動作成・コミットしない)

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### `.env.local.example`(コミット対象)

```
# Anthropic API key — get one at https://console.anthropic.com
# This file is a TEMPLATE; copy to .env.local and fill in the real value.
ANTHROPIC_API_KEY=
```

既存の `.gitignore` は `.env*` を既にブロック済みなので `.env.local` は安全。
`.env.local.example` だけ追跡するため、`.gitignore` に `!.env.local.example` の 1 行を追加します。

---

## 10. Anthropic API キーの取得手順

1. https://console.anthropic.com にアクセス → Google / メールでサインアップ(既存なら普通にログイン)
2. 右上メニュー or 左サイドバーの **「Settings」→「API Keys」** を開く
3. **「Create Key」** を押す → 名前(例: `spark-code-local`)を入れて作成
4. 表示された **`sk-ant-api03-…` で始まる文字列をその場でコピー**
   - ウィンドウを閉じると二度と表示できない(漏らした場合は削除して作り直し)
5. **「Plans & Billing」** でクレカを登録、または Free クレジット($5)の残高を確認
   - Haiku 4.5 の判定 1 往復で概ね $0.001 未満、開発中にほぼ枯れない
6. プロジェクトルートに `.env.local` を作ってキーを貼る
7. `npm run dev` が既に起動していたら **再起動**(起動時にしか `.env.local` を読まないため)

---

## 11. デザイン方針

| 項目 | 値 |
|------|-----|
| ベース | ダークモード基本(`#0f172a` = slate-900) |
| サーフェス | `#1e293b` (slate-800) |
| 境界 | `#334155` (slate-700) |
| テキスト | `#e2e8f0` (slate-200) |
| アクセント | 紫 `#a855f7` (purple-500) → ピンク `#ec4899` (pink-500) のグラデーション |
| フォント | Inter + Noto Sans JP |
| 角丸 | `rounded-xl` / `rounded-2xl` 中心 |
| アニメ | `hover` 時のみ、控えめ(`hover:-translate-y-0.5 transition` 程度) |
| 余白 | 多め、読みやすさ優先 |

グラデーションは **レッスン Step ハイライトとボタン hover のみ**。多用しない。

---

## 12. 実装順序(MVP 完成までの道筋)

各ステップ終了時点で `npm run dev` で動作確認できる単位に切ってあります。

1. **骨組み**: 依存 install → `.env.local` / `.env.local.example` 作成 → `.gitignore` 調整 → `globals.css` と `app/layout.tsx` のテーマ/フォント差し替え → `app/page.tsx` を `/lesson/1` へ redirect ✅ **Phase 1 完了**
2. **レッスンデータ**: `lib/lessons.ts` に Lesson 1 の 3 ステップを定義(UI とロジックの手戻り防止のため先に固める) ✅ **Phase 1 完了**(Codex レビューで `match`/`solution` を `lib/lessons-server.ts` に server-only 隔離)
3. **3 ペインの静的レイアウト**: `app/lesson/[id]/page.tsx` + `components/ThreePaneLayout.tsx`(中身はプレースホルダ) ✅ **Phase 1 完了**
4. **プレビュー**: `components/Preview.tsx` で iframe + srcdoc。空のエディタでもグラデ背景が見える状態を確認 ✅ **Phase 1 完了**
5. **コードエディタ**: `components/CodeEditor.tsx` で CodeMirror を配線。入力 → 親 state → Preview の srcdoc 更新まで通す ✅ **Phase 1 完了**
   - **← ここで「書けば見た目が変わる」MVP の核が完成(体験の 80%)**
6. **レッスンパネル**: `components/LessonPanel.tsx` で Markdown 描画 + 現在ステップのハイライト + AI 判定による「次へ」 ✅ **Phase 2 完了**
7. **Route Handler の骨**: `app/api/chat/route.ts` で 4 タイプすべてスタブ応答 → クライアントから POST できることを確認 ✅ **Phase 2 完了**
8. **AI 結線 その 1**: `judge` を本実装。**正規表現を source of truth** にして一次判定(Step 1-2 は §3 の 3 条件)→ 通ったら Claude Haiku でゆるく追認(**不合格扱いはしない・メッセージのみ添える**)→ 別途 `praise` を 1 往復(best-effort、失敗しても進行は確定・デフォルト褒め文言でフォールバック)✅ **Phase 2 完了**
9. **AI 結線 その 2**: `hint` ボタンと `question` フォームを `components/ChatPanel.tsx` に実装、履歴表示(textarea + Enter 送信 + 文字数カウンタ + busy 中は入力抑止)✅ **Phase 2 完了**
10. **仕上げ**: Step 1-3 の「Coming Soon」、エラー状態(API 失敗・ネット断)、ローディング、hover マイクロアニメ、空入力ガード ✅ **Phase 2 完了**

---

## 13. 想定ハマりポイントと対処

| # | ポイント | 対処 |
|---|---|---|
| 1 | Next.js が **16.2.4** なのに「15」想定で書くと微妙に違うエラー | `node_modules/next/dist/docs/01-app/` を都度参照。特に Route Handler と Font |
| 2 | Tailwind v4 は `tailwind.config.js` を置かない | トークンは `globals.css` の `@theme inline` に書く。v3 流儀で config を置くと警告 |
| 3 | CodeMirror は SSR 不可(`window` 参照) | ラッパーコンポーネントに `"use client"` を必ず付ける |
| 4 | iframe の `sandbox` を忘れると親ページが汚染される | `<iframe srcDoc={html} sandbox="" title="preview">` を**必ず**使う(値は空文字 = 全制限 ON)。`srcDoc` は親オリジン扱いになり得るため、sandbox 未指定だと **親 DOM・親オリジン cookie/storage にアクセス可能**。MVP は JS 実行を許可する理由がないので `allow-scripts` は付けない(最小権限)。将来 JS レッスンを追加するときに `allow-scripts` を足す |
| 5 | API キーがクライアントに漏れる | `lib/anthropic.ts` 先頭に `import "server-only"`。`NEXT_PUBLIC_*` は**絶対に使わない** |
| 6 | Anthropic SDK が Edge ランタイムでコケる | Route Handler は Node ランタイムのまま(`export const runtime = "edge"` を書かない) |
| 7 | Claude の JSON 応答に前置きテキスト混入 | `judge` プロンプトで「JSON のみ、前置き・コードブロック禁止」を強く指示。`JSON.parse` は try/catch で包む |
| 8 | React 19 Strict Mode で fetch が 2 回走る(dev のみ) | 判定リクエストは**ユーザー操作トリガー**にし、`useEffect` で自動発火させない |
| 9 | `.env.local` 編集後に反映されない | `npm run dev` を**再起動**。Next.js は起動時にしか読まない |
| 10 | Haiku のレート上限に開発中ぶつかる | 一次正規表現で弾けるケースは API を呼ばない。自動連打を作らない |
| 11 | 日本語文字化け | Route Handler は `Response.json()` で UTF-8 自動。HTML プレビューは `<meta charset="utf-8">` を srcdoc 冒頭に固定で入れる |
| 12 | 判定データ(`match`/`solution`)がクライアントバンドルに漏洩 | [lib/lessons.ts](../lib/lessons.ts)(public)と [lib/lessons-server.ts](../lib/lessons-server.ts)(server-only)に分離。後者に `import "server-only"` を付けてクライアントへの誤 import をビルドエラーにする。**Phase 1 の Codex レビューで検出** |
| 13 | `lessonId` 変更時に `LessonWorkspace` の state が leak する(次レッスンが短かったら crash 可能性) | `app/lesson/[id]/page.tsx` で `<LessonWorkspace key={lesson.id} ... />` として強制 remount。**Phase 1 の Codex レビューで検出** |
| 14 | Markdown 記法(`` `code` ``・`**bold**` など)が raw で描画される | [components/LessonPanel.tsx](../components/LessonPanel.tsx) で `react-markdown` + `remark-gfm` + `components` マップ(`<code>` / `<strong>` などを dark テーマに合わせる)。**`instruction` だけでなく `overview` も同じ経路に通す**(Phase 1 round 2 で拾った regression)|
| 15 | hint / question プロンプトが `stepId` だけだとモデルが文脈を持てず ungrounded(レッスンと無関係なヒント・誤答が出やすい) | [lib/lessons.ts](../lib/lessons.ts) に `getStep(stepId)` を追加 →  [lib/prompts.ts](../lib/prompts.ts) の `stepContext()` ヘルパでレッスン名・ステップタイトル・指示文を全 4 タイプの user プロンプトに注入。**Phase 2 の Codex レビューで検出** |
| 16 | サーバ側にサイズ上限がないと **直接 POST**(curl 等)で巨大入力を Anthropic に流せる(コスト・レート上限の事故源) | [app/api/chat/route.ts](../app/api/chat/route.ts) で `MAX_CODE_LENGTH=10000` / `MAX_QUESTION_LENGTH=500` / `MAX_STEP_ID_LENGTH=32`、超過時 typed 413 を返す。**Phase 2 の Codex レビューで検出** |
| 17 | サーバ caps をクライアント上限より**緩く**設定すると、501–1000 文字のような「クライアント UI を通れないが直 POST で通る」穴ができる | サーバ caps はクライアント実上限と**完全一致**させる(`MAX_QUESTION_LENGTH=500` ↔ textarea の `maxLength=500`)。コードコメントに「must match the client surface」を明記して再発防止。**Phase 2 round 2 で拾った regression** |
| 18 | `callChat()` が `res.json() as ChatResponse` で blind cast すると、proxy / 5xx の異形 JSON を受け入れて undefined を画面に出す | [components/LessonWorkspace.tsx](../components/LessonWorkspace.tsx) に `isChatResponse()` runtime guard を追加(type 判別 + `message: string` + `judge.correct: boolean`)。guard 失敗で throw → UI ではエラーバブルに変換。**Phase 2 の Codex レビューで検出** |
| 19 | Anthropic SDK の `resp.content` は `text` / `thinking` / `tool_use` 等の union 型。`(b): b is {type:"text",text:string} =>` のような type predicate を直接書くと、SDK 内の `TextBlock` の `citations` 必須フィールドが欠けて TS2677 | [lib/anthropic.ts](../lib/anthropic.ts) では `.map(b => b.type === "text" ? b.text : "").join("")` のフォールバック実装で union を畳む(predicate を書かない)|
| 20 | judge / hint / question の API 呼び出し中も入力 UI が押せると、クリックは届くが workspace 側で握り潰され「無反応」と感じる | [components/ChatPanel.tsx](../components/ChatPanel.tsx) に `isBusy: boolean` prop を追加し、textarea / 送信ボタン / ヒントボタンの **3 要素すべて** を disable。busy 中は placeholder を「先生が考え中…」に切り替え。busy 解除で自動復帰。**Phase 2 後追いレビューで検出** |

---

## 14. 完成判定

### Phase 1 の完成判定(達成済み)

第 1 段階「体験のコア」が動く状態の完成条件。**すべて達成済み**。

1. ✅ `npm install && npm run dev` で http://localhost:3000 が `/lesson/1` にリダイレクト
2. ✅ 3 ペイン表示(左: レッスン説明 / 中: エディタ / 右上: プレビュー / 右下: チャットプレースホルダ)
3. ✅ エディタが空でもプレビューにグラデ背景が見える(プリセット CSS が効いている)
4. ✅ エディタに `<h1>` を入力するとプレビューに即反映(`code` state → iframe srcDoc)
5. ✅ iframe に `sandbox=""`(値は空文字 = 最小権限)が付いている
6. ✅ [lib/lessons.ts](../lib/lessons.ts)(public データ)と [lib/lessons-server.ts](../lib/lessons-server.ts)(`import "server-only"` による判定データ隔離)に型付き定義が揃っている
7. ✅ 手動の「次へ」ボタンで仮動作(`// TODO: 第2段階で AI 判定に差し替え` コメント付き)

### MVP 全体の完成判定(達成済み)

Phase 2 完了時点ですべて満たす。**全項目達成済み**(下記 Phase 2 セルフチェックを参照)。

1. `npm install && npm run dev` → http://localhost:3000 が `/lesson/1` にリダイレクト
2. エディタが空でも、右上プレビューにグラデ背景が見える(プリセット CSS が効いている)
3. エディタに `<h1>名前</h1>` と打つ → プレビュー中央に大きな「名前」
4. Step 1-1 が緑色になり、チャット欄に **具体的な褒め、または praise 失敗時はフォールバック文言(例: 「正解!その調子!」)** が表示される
5. Step 1-2 で `<h1>名前</h1>` のままだと **正規表現(一次判定)で不合格**になり、Step 1-1 合格状態のまま進めない旨のメッセージが表示される
6. 名前を自分のものに変えると Step 1-2 完了、Step 1-3 で Coming Soon 画面に遷移
7. どのステップでも「ヒント」ボタンが機能する(答えそのものは出ない)
8. 下段チャット欄から自由質問に優しい日本語で回答が返る
9. DevTools Network タブで `/api/chat` レスポンスに API キーが含まれていない
10. `git status` で `.env.local` が untracked にも上がっていない

### Phase 2 セルフチェック(達成済み)

Phase 2 のスコープ(AI 結線・チャット UI・仕上げ)に対するセルフチェック。**全項目達成済み**。

1. ✅ Step 1-1 で `<h1>名前</h1>` を書くと judge が「正解!」と返し、コードに即した具体的な褒めが表示される(curl 検証済 → "完璧です！h1タグで大見出しを作れていますね。")
2. ✅ Step 1-2 で名前を変えずに進もうとすると AI が惜しい指摘(regex で先に弾き、デフォルト「おしい!…」を返す)
3. ✅ Step 1-2 で自分の名前に変えると合格、Step 1-3 の Coming Soon に遷移(`setStepIndex` で前進、最終 step は 🎉 + グラデーションの celebrate panel)
4. ✅ 任意のステップで「ヒント」ボタンが機能(プロンプトに「直接の解答は禁止」を明示、grounded な気づきを返す)
5. ✅ 自由質問に優しい日本語で返答(grounded:現在のレッスン/ステップ/instruction/コードを context として注入)
6. ✅ DevTools Network タブで `/api/chat` レスポンスに API キー無し(`server-only` 経由で server-side のみ)
7. ✅ API 失敗時にエラー表示(白画面にならない / `isChatResponse` guard + try/catch でチャットの rose エラーバブルに変換)
8. ✅ Step 1-2 のエッジケース全パターン期待通り(curl で全 4 件確認:`<h1>かず</h1>` 合格 / `<h1>名前</h1>` 不合格 / `<h1></h1>` 不合格 / `<h1> かず </h1>` 合格)

### Step 1-2 判定のエッジケーステスト

下表すべてを MVP 完成条件に含める(正規表現レベルで合否が一致すること)。

| # | 入力 | 期待結果 | 備考 |
|---|------|---------|------|
| 1 | `<h1>かず</h1>` | 合格 | 普通の名前 |
| 2 | `<h1>名前</h1>` | **不合格**(1-1 合格のまま) | プレースホルダのまま進めない |
| 3 | `<h1></h1>` | **不合格** | 空要素 |
| 4 | `<h1> かず </h1>` | 合格 | 前後空白は trim してから判定 |
| 5 | `<h1>aaa</h1>` | 合格(ただしメッセージで「名前入れてみて」と促す) | 二次(Claude)が「名前っぽくない」と返してもステップ進行は確定 |

---

## 15. 将来拡張への布石(MVP には入れない)

- `lib/lessons.ts` を **配列構造**にしておき、Lesson 2 以降を追加するときファイル構造は触らずデータだけ増やす
- `lib/prompts.ts` の共通トーンはレッスン非依存にする(タイプ別の差分だけを関数化)
- `previewCss` はステップではなくレッスン単位で持つ(CSS は学習者が触らない範囲で徐々に豪華にしていく)
- チャット履歴はメモリ(`useState`)のみ。永続化するなら localStorage → Supabase の順で段階追加
- **多ターン対話対応**: MVP は `question` を単発リクエストで送るが、Phase 2 で会話履歴を API に送る多ターン対話に拡張する。その際に破壊的変更が出ないよう、`lib/prompts.ts` のシグネチャを将来 `messages: Message[]` 形式を受け取れる形で設計しておくと良い(※必須ではない)
- **Codex レビュースクリプト**: Phase 1 で [scripts/codex-review.sh](../scripts/codex-review.sh) と [scripts/review-schema.json](../scripts/review-schema.json) を配置済み(`/codex-review` スキルから自動コピー)。`PRIMARY_MODEL`/`FALLBACK_MODEL` は利用可能なモデル(当環境では `gpt-5.4`)に差し替え済み。Phase 2 で secret パターンを `=` 必須に絞り込み(`ANTHROPIC_API_KEY` 等の env 参照を bare 名で flag していた false positive を解消)。残課題: `.env.local.example` のファイル名 false positive(レビュー直前に `git restore --staged .env.local.example` で除外)— 将来的に `scripts/codex-review.sh` の SENSITIVE_PATTERNS を `\.env\.(?!local\.example)` に絞れば解消
- **Codex CLI のバージョン管理**: Phase 2 のレビュー中、サーバ側が `gpt-5.4` 用に新 CLI を要求 → CLI 0.44.0 → 0.125.0 にアップデート(`npm install -g @openai/codex`)。今後 OpenAI 側のモデル更新で同様の要求が来る可能性があるので、レビューで HTTP 400 が出たらまず CLI バージョンを疑う運用に
- **runtime validation の共有スキーマ化**: 現状 [app/api/chat/route.ts](../app/api/chat/route.ts) の `isValidRequest`(server)と [components/LessonWorkspace.tsx](../components/LessonWorkspace.tsx) の `isChatResponse`(client)を**手書きで二重定義**している。Phase 3 以降で Zod / Valibot による共有スキーマ + 自動推論に置き換える候補(MVP 範囲では過剰なため敢えて見送り)
- デプロイ(Vercel)・認証・進捗保存は MVP 後の別フェーズ

---

## 付録: スコープに **含まれない** もの

- ログイン / サインアップ
- 進捗の永続化(DB も localStorage も)
- Lesson 2 以降
- デプロイ設定(Vercel 等)
- モバイル最適化(PC ブラウザで動けば OK)
- チャット履歴の保存
- 複数ファイル編集(HTML 1 枚のみ)
- CSS/JS エディタ(HTML のみ触らせる)
- ダーク / ライトテーマ切り替え(ダーク固定)
