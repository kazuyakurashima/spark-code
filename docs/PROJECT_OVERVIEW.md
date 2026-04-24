# SparkCode — プロジェクト概要

> **Status**: MVP 実装前 / プラン確定段階(Codex レビュー 2 回目反映済み、実装フェーズ待ち)
> **最終更新**: 2026-04-25

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

## 2. MVP のスコープ

**Lesson 1 が通しで動くこと** だけを目指します。認証・進捗保存・他レッスンは対象外。ローカル `npm run dev` で起動すれば OK。

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

## 3. 画面構成(3 ペイン)

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

## 4. AI の役割(4 つの機能)

すべて **1 つの Route Handler** (`app/api/chat/route.ts`) で処理し、リクエストボディの `type` で分岐します。

| type | いつ発動 | 入力 | 出力 |
|------|---------|------|------|
| **judge** | ステップ完了候補のコードを判定 | 現在のステップ / 学習者コード / 模範解答 | `{ correct: boolean, message: string }` |
| **hint** | 学習者が「ヒント欲しい」ボタンを押下 | 現在のステップ / 学習者コード | 段階的ヒント(いきなり答えは言わない) |
| **praise** | 正解した瞬間 | 現在のステップ / 学習者コード | そのコードに合わせた具体的な褒め |
| **question** | 学習者が自由質問を送信 | 現在のステップ / 学習者コード / **最新の質問 1 件のみ**(MVP は会話履歴を API に送らない) | 初心者に寄り添った日本語解説 |

> ※ MVP では API に送るのは直近の質問 1 件のみ。UI 上は過去の Q&A を履歴として表示するが、API 側には履歴を送らない。履歴送信対応は Phase 2 の拡張(§14 参照)

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

## 5. 技術スタック

| 領域 | 技術 | メモ |
|------|------|------|
| フレームワーク | **Next.js 16.2.4** (App Router) | ※ブリーフには「15」と書かれていたが実際は 16.2.4 。AGENTS.md が警告する通りトレーニングデータ非互換あり |
| 言語 | TypeScript 5 | セットアップ済み |
| React | 19.2.4 | セットアップ済み |
| スタイル | Tailwind CSS v4 | セットアップ済み(`@import "tailwindcss"` + `@theme inline`)。`tailwind.config.js` は使わない |
| コードエディタ | **CodeMirror 6** (`@uiw/react-codemirror`) | 下記「エディタ選定」参照 |
| プレビュー | `<iframe srcDoc={...} sandbox="" title="preview">` | プリセット CSS を srcdoc に埋め込み。**素の `sandbox`(値は空文字)で最小権限**。MVP は HTML のみ・JS 実行不要のため `allow-scripts` も付けない。将来 JS レッスンを追加するときに `allow-scripts` へ緩める |
| AI | **Anthropic Claude Haiku 4.5** (`claude-haiku-4-5` エイリアス) | Route Handler 経由でサーバーサイドから呼ぶ。API キーはクライアントに絶対出さない。エイリアスは最新スナップショットを自動参照 |
| 状態管理 | React `useState` のみ | MVP は永続化しない |
| Markdown 表示 | `react-markdown` + `remark-gfm` | レッスン説明用 |

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

## 6. ファイル構成(予定)

```
app/
├── layout.tsx                [編集] Inter + Noto Sans JP、ダーク既定
├── page.tsx                  [編集] /lesson/1 へリダイレクト
├── globals.css               [編集] 背景 #0f172a 系、紫〜ピンクのアクセント変数
├── lesson/
│   └── [id]/
│       └── page.tsx          [新規] 3 ペイン画面(Client Component)
└── api/
    └── chat/
        └── route.ts          [新規] POST、body.type で 4 種に分岐

components/
├── ThreePaneLayout.tsx       [新規] 左25% / 中35% / 右40%
├── LessonPanel.tsx           [新規] Markdown 表示 + ステップハイライト
├── CodeEditor.tsx            [新規] CodeMirror 6 ラッパー("use client")
├── Preview.tsx               [新規] iframe + srcdoc、プリセット CSS 埋込
└── ChatPanel.tsx             [新規] ヒント/質問ボタン + 履歴表示

lib/
├── lessons.ts                [新規] Lesson 1 の 3 ステップ定義(TS データ)
├── prompts.ts                [新規] 4 タイプの system/user プロンプト組立
└── anthropic.ts              [新規] "server-only"、Anthropic SDK ラッパー

types/
└── chat.ts                   [新規] ChatRequest / ChatResponse 型

.env.local                    [新規・gitignore] ANTHROPIC_API_KEY=...
.env.local.example            [新規・コミット対象] テンプレートのみ
```

---

## 7. 使うライブラリとインストールコマンド

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

## 8. 環境変数

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

## 9. Anthropic API キーの取得手順

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

## 10. デザイン方針

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

## 11. 実装順序(MVP 完成までの道筋)

各ステップ終了時点で `npm run dev` で動作確認できる単位に切ってあります。

1. **骨組み**: 依存 install → `.env.local` / `.env.local.example` 作成 → `.gitignore` 調整 → `globals.css` と `app/layout.tsx` のテーマ/フォント差し替え → `app/page.tsx` を `/lesson/1` へ redirect
2. **レッスンデータ**: `lib/lessons.ts` に Lesson 1 の 3 ステップを定義(UI とロジックの手戻り防止のため先に固める)
3. **3 ペインの静的レイアウト**: `app/lesson/[id]/page.tsx` + `components/ThreePaneLayout.tsx`(中身はプレースホルダ)
4. **プレビュー**: `components/Preview.tsx` で iframe + srcdoc。空のエディタでもグラデ背景が見える状態を確認
5. **コードエディタ**: `components/CodeEditor.tsx` で CodeMirror を配線。入力 → 親 state → Preview の srcdoc 更新まで通す
   - **← ここで「書けば見た目が変わる」MVP の核が完成(体験の 80%)**
6. **レッスンパネル**: `components/LessonPanel.tsx` で Markdown 描画 + 現在ステップのハイライト + 手動「次へ」ボタン(AI 判定なしで動作確認)
7. **Route Handler の骨**: `app/api/chat/route.ts` で 4 タイプすべてスタブ応答 → クライアントから POST できることを確認
8. **AI 結線 その 1**: `judge` を本実装。**正規表現を source of truth** にして一次判定(Step 1-2 は §2 の 3 条件)→ 通ったら Claude Haiku でゆるく追認(**不合格扱いはしない・メッセージのみ添える**)→ 別途 `praise` を 1 往復(best-effort、失敗しても進行は確定・デフォルト褒め文言でフォールバック)
9. **AI 結線 その 2**: `hint` ボタンと `question` フォームを `components/ChatPanel.tsx` に実装、履歴表示
10. **仕上げ**: Step 1-3 の「Coming Soon」、エラー状態(API 失敗・ネット断)、ローディング、hover マイクロアニメ、空入力ガード

---

## 12. 想定ハマりポイントと対処

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

---

## 13. 完成判定(MVP が動いたと言える条件)

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

## 14. 将来拡張への布石(MVP には入れない)

- `lib/lessons.ts` を **配列構造**にしておき、Lesson 2 以降を追加するときファイル構造は触らずデータだけ増やす
- `lib/prompts.ts` の共通トーンはレッスン非依存にする(タイプ別の差分だけを関数化)
- `previewCss` はステップではなくレッスン単位で持つ(CSS は学習者が触らない範囲で徐々に豪華にしていく)
- チャット履歴はメモリ(`useState`)のみ。永続化するなら localStorage → Supabase の順で段階追加
- **多ターン対話対応**: MVP は `question` を単発リクエストで送るが、Phase 2 で会話履歴を API に送る多ターン対話に拡張する。その際に破壊的変更が出ないよう、`lib/prompts.ts` のシグネチャを将来 `messages: Message[]` 形式を受け取れる形で設計しておくと良い(※必須ではない)
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
