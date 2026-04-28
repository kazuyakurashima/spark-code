# T20 Phase 3.1 通し動作チェックリスト

> **対応要件**: [PHASE3_REQUIREMENTS.md §18.1](PHASE3_REQUIREMENTS.md#181-phase-31-完了条件)(完了条件 10 項目)
> **実施日**: 2026-04-27
> **実施者**: Claude Code(自動部分)+ かず(手動部分)

---

## ⚠️ 最重要発見:Vercel デプロイは Phase 3.1 反映前

ローカル `npm run dev`(http://localhost:3000)は **Phase 3.1 全機能が完全動作**。
ただし **https://spark-code-mu.vercel.app/ は Phase 1-2 MVP 時点で停止**:

| 項目 | https://spark-code-mu.vercel.app/ |
|---|---|
| `/lesson/1` | ✅ 200(ただし MVP 版、5 ボタンなし、LocationBar なし) |
| `/lesson/2`〜`/lesson/6` | ❌ **404**(未デプロイ) |
| ChatPanel 5 ボタン | ❌ **未反映**(`どこが違う` / `やさしく説明` / `できたこと` / `もっと良く` 全て不在) |

**手動確認は localhost(`http://localhost:3000`)で実施してください**。Vercel 反映には別途デプロイが必要(`git push origin main` 後の Vercel 自動ビルド、または `npx vercel --prod`)。

---

## §18.1 完了条件 10 項目 進捗

種別の凡例:
- **手動不要**: 自動チェックのみで判定可能(T20 / T21 内で完結する)
- **手動 + 自動**: 自動で部分確認、最終確定はかずの手動確認後
- **手動のみ**: 主観 / DevTools / 体験ベースで Claude には自動化できない

集計:
- 手動不要 = **5 項目**(#5、#6、#8、#9、#10)
- 現時点で確定 = **4 項目**(#5、#6、#8、#9)/ #10 は T21 待ち
- 手動確認待ち = **5 項目**(#1、#2、#3、#4、#7)

| # | 項目 | 種別 | 結果 |
|---:|---|---|---|
| 1 | ユーザーが Lesson 1〜6 を無料で体験できる | 手動 + 自動 | ✅ 自動(ページ 200 + 5 ボタン検出) + 🟡 手動確認待ち(通し体験 B-1) |
| 2 | 1 周目終了時に、HTML/CSS/JS/Sparkコーチの全体像が見える | 手動のみ | 🟡 手動確認待ち(B-1 末尾の L6) |
| 3 | Lesson 6 後に自然な課金導線(UI のみ)が出る | 手動 + 自動 | ✅ 自動(L6 で UpsellBlock + FuturePreview 文言検出) + 🟡 手動確認待ち(B-5) |
| 4 | 各レッスンに、目的・コード入力・プレビュー・Sparkコーチフィードバックがある | 手動 + 自動 | ✅ 自動(全レッスンで 5 ボタン + LocationBar 描画) + 🟡 手動確認待ち(B-1 通し)|
| 5 | Sparkコーチの 4 役割(常設ボタン 5 つ)が UI に反映されている | 手動不要 | ✅ **確定**(L1-L5 すべてに 5 ボタン全部検出) |
| 6 | 画面上部に現在地表示がある | 手動不要 | ✅ **確定**(LocationBar 全レッスンで描画 — 周回プログレッション + 4 役割凡例) |
| 7 | ユーザーが「自分のカードが育っている」と感じられる | 手動のみ(主観) | 🟡 手動確認必須(かずの主観判断) |
| 8 | TODO_PHASE3.md が作成され、各タスクに対応要件が紐づいている | 手動不要 | ✅ **確定**(21 タスク × 82 件の対応要件参照) |
| 9 | PHASE3_REQUIREMENTS_CHECK.md が作成され、完了タスクごとの要件適合チェックが記録されている | 手動不要 | ✅ **確定**(T1-T19 + グループ 4 判断済み事項記録済) |
| 10 | Codex Review で APPROVED を得る | 手動不要(T21 で実施) | ⏳ T21 待ち |

---

## A. 自動確認結果(localhost:3000、2026-04-27)

### A-1. ビルド / 静的解析

| チェック | 結果 |
|---|---|
| `next build` | ✅ 成功(`Compiled successfully in 2.1s`、TypeScript 1.4s クリア)|
| Routes 一覧 | ✅ `/`(static)、`/lesson/[id]`(dynamic)、`/api/chat`(dynamic)、`/api/log`(dynamic)、`/api/report/[sessionId]`(dynamic) |
| TypeScript `tsc --noEmit` | ✅ クリーン(エラーなし) |
| ESLint | ✅ クリーン |

### A-2. レッスンページレンダリング

| URL | HTTP | 主要文言確認 |
|---|---|---|
| `/lesson/1` | 200 | ✅ "名前を画面"、5 つの quick-action ボタン全て検出 |
| `/lesson/2` | 200 | ✅ 5 ボタン全て |
| `/lesson/3` | 200 | ✅ 5 ボタン全て |
| `/lesson/4` | 200 | ✅ 5 ボタン全て、"color"、"色" |
| `/lesson/5` | 200 | ✅ 5 ボタン全て、"textContent"、"JavaScript"、"sandbox" |
| `/lesson/6` | 200 | ✅ "1 周目クリア"、"今のカード"、"未来のカード"、"SparkPlus"、"後で考える"、"Sparkコーチからの振り返り"、"5 つの体験"、"4 つの役割" |

### A-3. iframe sandbox(L5 のみ allow-scripts、他は最小権限)

| Lesson | sandbox 属性 |
|---|---|
| L1 | `sandbox=""` ✅ |
| L2 | `sandbox=""` ✅ |
| L3 | `sandbox=""` ✅ |
| L4 | `sandbox=""` ✅ |
| L5 | `sandbox="allow-scripts"` ✅(name.textContent 実行のため) |

### A-4. LocationBar(全 6 レッスン)

検出文言:
- **3 周構成プログレッション**: "1 周目 [全体像]"、"2 周目 [整える]"、"3 周目 [動かす]" (全レッスン共通) ✅
- **4 役割凡例**: "HTML=中身"、"CSS=見た目"、"JS=動き"、"Sparkコーチ=先生" ✅
- **Lesson n / 6 表示**: ✅(React のテキストノード分割で raw HTML 検索は不能だが、LocationBar コンポーネントが `Lesson {lesson.id} / {totalLessons}` で正しく描画)

### A-5. L6 recap 専用画面

L6 は workspace ではなく recap 画面(別レイアウト):
- ✅ 5 ボタン(ヒント / どこが違う等)は **意図的に不在**(recap には不要)
- ✅ Sparkコーチ振り返りパネル / 5 要素体験リスト / 4 役割マトリクス / FuturePreview / UpsellBlock すべて存在

### A-6. /api/chat 全 8 タイプ smoke

全タイプ origin=`http://localhost:3000` で 200 + 期待 JSON 形式:

| type | HTTP | 応答サンプル |
|---|---|---|
| judge | 200 | `{"type":"judge","correct":true,"message":"素晴らしい！..."}` |
| hint | 200 | `{"type":"hint","message":"いいですね！..."}` |
| praise | 200 | `{"type":"praise","message":"かずさんの名前が画面に大きく..."}` |
| question | 200 | `{"type":"question","message":"いい質問ですね！..."}` |
| explain | 200 | `{"type":"explain","message":"`<h1>`(見出しタグ)は..."}` |
| improve | 200 | `{"type":"improve","message":"すごい！..."}` |
| diagnose | 200 | `{"type":"diagnose","message":"今のコードは合格パターンに当たっています!..."}` |
| summary | 200 | `{"type":"summary","message":"まだ振り返るには早いね!..."}`(sessionId 経由)|

### A-7. /api/log + /api/report origin gate + 書き込み

| ケース | HTTP | 期待 | 結果 |
|---|---|---|---|
| /api/log Origin ヘッダなし | 403 | `forbidden origin` | ✅ |
| /api/log Origin: http://localhost:3000 + 正しいスキーマ | 200 | `{"ok":true}` | ✅ |
| /api/log Origin: https://evil.example.com | 403 | `forbidden origin` | ✅ |
| /api/log + step_started + step_completed 順次書き込み | 200 × 2 | `{"ok":true}` × 2 | ✅ |
| /api/report/{sid} 集計 | 200 | `completedSteps=1` で取得 | ✅(書き込み後すぐに反映) |

→ Group 3 round 3 で導入した **Origin スキームパリティチェック**(`request.nextUrl.origin` 完全一致)が期待通り動作。

> **A-7 の限界(B-6 で補う)**:
> - これは **「書いた値が API 経由で読み戻せる」end-to-end 疎通テスト** であって、`learning_events` テーブルの **件数の直接確認** ではない。RLS / dashboard 経由の row count や、想定外の重複インサート(events が二重に記録されているか等)は本テストでは見えない。**B-6 の Supabase dashboard チェックで補完する**
> - `/api/chat` レスポンスに API キーが**含まれていない**ことの確認も自動側ではしていない(レスポンス body の構造確認のみ)。**B-6 の DevTools 確認で補完する**

### A-8. 3 点セットテンプレ

[lib/three-point-templates.ts](../lib/three-point-templates.ts):
- ✅ 全 18 件(Lesson 1-6 × {perfect / struggled / persevered}× 3 = 18)
- ✅ `classifyEffort(maxTries, totalHints)` の閾値が仕様通り:
  - `perfect`: `maxTries <= 1 && totalHints === 0`
  - `struggled`: `maxTries <= 3 && totalHints <= 1`
  - `persevered`: それ以外

### A-9. ドキュメント整備状態

| ドキュメント | 存在 | サイズ | 整備状態 |
|---|---|---|---|
| TODO_PHASE3.md | ✅ | 28 KB | T1-T21 全 21 タスク + 9 グループ、§ 対応要件 82 件 |
| PHASE3_REQUIREMENTS_CHECK.md | ✅ | 46 KB | T1-T19 自己評価記録 + グループ 4 判断済み事項 |
| PROJECT_OVERVIEW.md | ✅ | 36 KB | T19 で Phase 3.1 反映済(関連ドキュメント表 / Phase 進捗 / 8 機能 / 実在ファイル構成) |
| CURRICULUM.md | ✅ | 15 KB | §5-§8 抜粋 + Phase 3.1 実装状況 |
| SPARK_COACH.md | ✅ | 12 KB | §9 抜粋 + 実装マップ |

---

## B. かず向け 手動確認手順(localhost で実施)

> 開発サーバが落ちている場合: `npm run dev` で起動 → http://localhost:3000 を開く。
> Vercel デプロイ版は Phase 3.1 反映前なので **絶対に手動確認に使わないでください**。

### B-1. Lesson 1〜6 通し体験(§18.1 #1, #2, #4, #7)

**所要時間**: 15〜20 分。

#### Lesson 1: 名前が画面に出る

URL: http://localhost:3000/lesson/1

- [ ] LocationBar 上段に「**1 周目 [全体像]**」がハイライト、下段に「HTML=中身 / CSS=見た目 / JS=動き / Sparkコーチ=先生」凡例
- [ ] 中段に「**Lesson 1 / 6 名前を画面に表示しよう**」
- [ ] エディタに `<h1>かず</h1>` と書く → プレビューに「かず」が大きく表示
- [ ] 「**答え合わせする**」CTA 押下 → 緑のチェック / 具体的な褒め / 3 点セットが赤紫グラデのカード(🪄 / 🌱 / 🎁)で**目立って表示される**
- [ ] 「**Lesson 2 へ進む**」リンクで遷移

#### Lesson 2: 自己紹介文

URL: http://localhost:3000/lesson/2

- [ ] LocationBar の Lesson が 2 / 6 に
- [ ] `<p>水戸の塾で先生をしています</p>` 等を追加 → プレビュー反映
- [ ] 答え合わせ → 合格 → 3 点セット表示

#### Lesson 3: 好きなものリスト

URL: http://localhost:3000/lesson/3

- [ ] `<ul><li>...</li><li>...</li></ul>` を 2 項目以上書く
- [ ] 答え合わせ合格

#### Lesson 4: 色を変える(`<style>` 導入)

URL: http://localhost:3000/lesson/4

- [ ] `<style>h1 { color: pink; }</style>` を書く → 文字がピンクに
- [ ] **エッジケース**: `.h1 { color: red; }` のような誤セレクタは合格しないこと(Group 1 round 3 修正の確認)
- [ ] 答え合わせ → 「色変わった!」感のある合格メッセージ

#### Lesson 5: 1 行 JS で文字が変わる

URL: http://localhost:3000/lesson/5

- [ ] エディタには「お膳立てコード」がコメント表示されている(学習者は **1 行だけ**書く)
- [ ] `name.textContent = "こんにちは!";` を書く → プレビューの文字が即座に書き換わる(JS 実行されている = sandbox=allow-scripts 効いている)
- [ ] **エッジケース**: `myEl.textContent = "..."` は合格しない(Group 2 で `name` リテラル限定に締めた)
- [ ] 答え合わせ合格 → 3 周目で JS 自分で書ける予告メッセージ

#### Lesson 6: 1 周目クリア + 振り返り

URL: http://localhost:3000/lesson/6

- [ ] **🎉 1 周目クリア!おつかれさま!** が大きく表示
- [ ] 「**これまでの 5 つの体験**」カード(L1〜L5 × 5 枚)
- [ ] 「**SparkCode の 4 つの役割**」マトリクス(HTML / CSS / JavaScript / Sparkコーチ)
- [ ] **Sparkコーチからの振り返り**(紫→ピンクのグラデパネル、3 段落)
- [ ] **未来のカードプレビュー**: 左に「今のカードのサンプル」(白背景シンプル)、右に「未来のカードのサンプル」(紫→ピンクのグラデカード、subtle pulse アニメ)
- [ ] **UpsellBlock**: §11.4 の課金前メッセージ(伴走 / 完成 / シェア)
- [ ] 主ボタン「**SparkPlus でカードを育てる(早期応援 月 498 円)**」+ 副ボタン「**後で考える**」
- [ ] **主ボタン押下** → 学習者向け placeholder メッセージ「もうすぐ公開予定です!…楽しみに待っていてくださいね 🎈」(開発者ジャーゴンが入っていないこと)
- [ ] 副ボタン押下 → UpsellBlock セクションが畳まれる

### B-2. Sparkコーチ常設 5 ボタン(§18.1 #5)

**所要時間**: 5〜10 分。Lesson 1 で全 5 ボタンを試す。

URL: http://localhost:3000/lesson/1(エディタに何か書いた状態で)

- [ ] **ヒントがほしい**(sky 色)→ 「次に〜してみましょう」形式の 1 文ヒント。完成形は出ていない
- [ ] **どこが違う?**(amber 色)→ 差分を 1 か所だけ指摘。**ステップは進まない**(LocationBar の Lesson 番号が変わらない)
- [ ] **やさしく説明して**(violet 色)→ `<h1>` の概念を 3-5 行で説明、技術名に注釈
- [ ] **できたことを教えて**(pink 色)→ 学習ログから「できるようになったこと」を 3 つ。最初は「まだ振り返るには早いね!」でも OK
- [ ] **もっと良くしたい**(emerald 色、全幅)→ 良かった点 + 次レッスン予告
- [ ] レッスンを切り替えると **チャット履歴がクリア**される(Lesson 1 で何か書いて Lesson 2 に行く → ChatPanel が空に)

### B-3. 3 点セット表示(§18.1 #4 含む)

**所要時間**: Lesson 1〜5 通しで自然に確認できる。

- [ ] 各レッスン完了時、ChatPanel に **大きく目立つ** 紫→ピンクのグラデ 3 段カードが現れる(他の通常メッセージとサイズ・色で差別化)
- [ ] 3 セクション:🪄 **今日できるようになったこと** / 🌱 **あなたのカードの進化** / 🎁 **次の楽しみ**
- [ ] 文面は過去形(「できました」)
- [ ] L1 を一発合格(エディタに最初から `<h1>かず</h1>`)→ **perfect 文面** が出る(例:「あっという間に〜」など)
- [ ] L2 でわざと間違える x2 + ヒント 1 回 → **struggled 文面** が出る
- [ ] L3 でわざと間違える x4 + ヒント 2 回 → **persevered 文面** が出る

### B-4. 現在地表示バー(§18.1 #6)

各レッスンを開いて確認:

- [ ] 上段の **3 周プログレッション** が紫→ピンクのグラデで現在の周をハイライト(L1〜L6 はすべて 1 周目)
- [ ] 中段が **Lesson n / 6 タイトル**
- [ ] 下段の **4 役割凡例** が読める文字サイズ(60 代視点)
- [ ] 狭い画面(モバイル / DevTools で 375px 幅)で凡例が折り返すこと、はみ出さないこと

### B-5. 課金導線(§18.1 #3、Lesson 6)

B-1 の Lesson 6 で確認(再掲)。特に:
- [ ] 文言が**学習者向け**(「Phase 3.2」「検証フィードバック」のような開発者用語が出ていないこと)
- [ ] subtle pulse は控えめで、過剰なチカチカ感がない(reduced-motion を有効にすると停止する)

### B-6. 既存機能の回帰確認(§18.1 #1 補強)

**Secrets 漏洩 / バックエンドデータ整合性まわり**(自動 A-7 では確認できない):

- [ ] DevTools Network タブで `/api/chat` レスポンスを開き、本文 / ヘッダのどこにも **ANTHROPIC_API_KEY 値**(`sk-ant-...`)が含まれていない
- [ ] 同じく `/api/log` のリクエストヘッダに **SUPABASE_SERVICE_ROLE_KEY** が露出していない(クライアント発の log は anon key のみであるべき)
- [ ] Supabase dashboard(または `psql`)で `learning_events` テーブルを開き、B-1 通し体験中の **行数の動き** を直接確認:
  - L1〜L5 を通すと、各レッスンで `step_started` / `step_completed` / `lesson_completed` 等が想定回数(各レッスン 3〜5 行程度)記録されている
  - **重複インサート**が発生していない(同 sessionId × 同 stepId × 同 eventType が短時間に二重記録されていないか)
  - **想定外の sessionId** が紛れ込んでいない(他人のセッションが見えていない = RLS が効いている)

**UI 状態 / エラーハンドリング**:

- [ ] 「ヒント / 質問送信」中に Send ボタンと textarea が disable され、placeholder が「先生が考え中…」に切り替わる
- [ ] 自由質問欄で 500 文字を超えるテキストを送信しようとすると、文字数カウンタが赤くなり送信できない
- [ ] エラー(API 失敗、ネット断)時にチャットに **rose 色のエラーバブル** が出る(白画面にならない)
- [ ] Summary ボタン:プライベートモード等で `localStorage.sessionId` が空の場合、ボタン押下で **チャット内 aria-live エラーバブル** が表示される(disabled 化はしない、グループ 4 判断 2)

---

## C. 自動確認で見つかった問題

### C-1. Vercel デプロイが Phase 3.1 反映前(**重大、要対処**)

| 状態 | 内容 |
|---|---|
| 現在のデプロイ | Phase 1-2 MVP(Lesson 1 のみ、ChatPanel に 5 ボタンなし、LocationBar なし) |
| GitHub main の現在 HEAD | `e2eda39` docs(phase3): T19 align project / curriculum / spark-coach docs(Phase 3.1 全機能 + ドキュメント整備済) |
| ローカル → Vercel 反映 | **`git push origin main` 後の Vercel 自動ビルドが必要**。または `npx vercel --prod`(`vercel` CLI ログイン済の場合) |

**対処案**:
1. ユーザーが `git push origin main` を実行 → Vercel 側で自動ビルド & デプロイ
2. 反映後にデプロイ URL での再確認を T20 のラスト工程として追加

(Claude Code は本番デプロイを user 確認なしには実行しません。デプロイ承認は user コマンドで受けます。)

### C-2. その他

ローカル dev に対する自動確認では **問題なし**。

---

## D. T20 完了判定

§18.1 10 項目の内訳(再掲):

- **手動不要 = 5 項目**(#5、#6、#8、#9、#10)
  - そのうち **現時点で確定 = 4 項目**(#5、#6、#8、#9)
  - **#10 は T21 で実施待ち**(自動だが T21 内で行う)
- **手動確認待ち = 5 項目**(#1、#2、#3、#4、#7)
  - **B-1 完走**(Lesson 1〜6 全部触る)= #1、#2、#4 を確定
  - **B-5 完走**(Lesson 6 課金導線)= #3 を確定
  - **#7「カードが育っている感」** はかずの主観判断

**「自動で X 項目確定」と要約するときは、必ず「現時点で確定 4 項目 / T21 待ち 1 項目 / 手動待ち 5 項目」の 3 段で表現する**(自動分は「手動不要」と「現時点で確定」を区別する)。

---

## E. 次のアクション

1. かず: 上記 B 項目を localhost で手動確認
2. 問題なければ:
   - PHASE3_REQUIREMENTS_CHECK.md に T20 エントリを「自己評価 OK」で追加
   - T21(Phase 3.1 全体に対する Codex Review)に進む
3. 問題があれば:
   - §13.5 のフィードバックループで Claude に共有 → 修正コミット → 再確認
4. **Vercel デプロイ**(C-1):T21 の前後どちらでも可。本番反映は user 操作待ち
