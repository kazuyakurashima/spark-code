# Sparkコーチ new endpoints — live snapshot

Captured: 2026-04-27T02:19:42Z
Model: claude-haiku-4-5 (alias)
Endpoints: `POST /api/chat` types `explain` / `improve` / `summary` / `diagnose`

Used as the Phase 3.1 検証 baseline for Sparkコーチが期待通りか.

---

## explain (やさしく説明して — §9.7.1)

### explain — Lesson 1 / Step 1-1 (with empty editor)

```json
{"stepId":"1-1","code":""}
```

>  # タグの基本形を理解しよう

HTML のタグは、**開始タグ**と**終了タグ**で文字を挟む形です。`<h1>` (見出しタグ)の場合、`<h1>ここに書いた文字</h1>` という形で、その間の文字が画面に大きく表示されます。

例えば `<h1>太郎</h1>` と書くと、「太郎」が見出しサイズで表示されるイメージです。まずはこの「挟む形」に慣れることが、HTML の第一歩ですよ！

### explain — Lesson 4 / Step 4-1 (mid-progress)

```json
{"stepId":"4-1","code":"<style></style>\n<h1>かず</h1>\n<p>水戸の塾で先生をしています</p>"}
```

>  いいですね！いまから **CSS** (スタイルシート・見た目を変えるルール)を使って、文字の色を変えていきます。

`<style>` タグの中に `h1 { color: pink; }` と書くと、`<h1>` (見出しタグ)の文字が pink(ピンク)に変わるんです。`color` は「色」という意味で、`: pink;` で「ピンク色にしてね」と指示しています。

あなたの `<h1>かず</h1>` も、この CSS ルールを書けば色が変わっちゃいます。好きな色を選んでチャレンジしてみてください！

### explain — Lesson 5 / Step 5-1 (fresh JS)

```json
{"stepId":"5-1","code":""}
```

>  JavaScript で画面の文字を変えるには、**変数** (箱のようなもの) に `.textContent` (「中身の文字」という意味) をつけて、`=` で新しい文字を入れるんです。

例えば `name.textContent = "おはよう";` と書くと、画面の `<h1>` タグの文字が「おはよう」に変わっちゃう、ということ。HTML で最初に書いた文字が、JavaScript で上書きされるイメージですね!


## improve (もっと良くしたい — §9.7.5)

### improve — Lesson 1 / Step 1-2 (basic <h1>)

```json
{"stepId":"1-2","code":"<h1>かず</h1>"}
```

>  いいですね！`<h1>`（見出しタグ）で自分の名前がちゃんと画面に表示されました。

次のレッスンでは、この名前の下に `<p>`（段落タグ）を使って自己紹介文を足すと、もっと充実した自己紹介ページになりますよ。楽しみにしていてね！

### improve — Lesson 4 / Step 4-1 (color change)

```json
{"stepId":"4-1","code":"<style>h1{color:pink;}</style>\n<h1>かず</h1>"}
```

>  いいね！`<style>` タグの中に CSS ルールを書いて、`h1` の `color` プロパティ(文字色)を `pink` に変えられました。完璧です！

次のレッスンでは、JavaScript を使って、ボタンをクリックしたときに見出しの文字そのものを別の言葉に変える方法を学びます。お楽しみに！

### improve — Lesson 5 / Step 5-1 (textContent)

```json
{"stepId":"5-1","code":"name.textContent = \"こんにちは!\""}
```

>  わあ、完璧です!📝 `textContent` で画面の文字を書き換える、その通りできてますね。

次のレッスンでは、**これまで学んだ 3 つの力(HTML・CSS・JavaScript)がどう一緒に働くのか、全体像が見えてくる**ようなお楽しみが待ってますよ!🎯

### improve — Lesson 6 / Step 6-1 (recap, no next lesson)

```json
{"stepId":"6-1","code":""}
```

>  1周目、本当にお疲れ様でした！🎉

**いまよくできている点:**
HTML / CSS / JavaScript の 3 つの役割(構造・見た目・動き)を一通り体験できたことが、いちばん大きな成長です。

**次の周回での予告:**
2周目では、いまバラバラに学んだ 3 つの技術を「組み合わせて、より複雑で実用的な機能」を作ることで、プログラミングの本当の面白さが見えてきますよ!


## summary (できたことを教えて — §9.7.3)

### summary — too-early case (no learning_events for this session)

Session id: `snap-early-19010` (no events posted)

### summary — too-early (sparseness fallback)

```json
{"stepId":"3-1","sessionId":"snap-early-19010"}
```

>  まだ振り返るには早いね!Lesson 1 を 1 つでもクリアすると、できたことを 3 つ振り返れるようになります。もう少しレッスンを進めてから、また聞きにきてください。


### summary — has-data case

Session id: `snap-late-15779`. Seed events posted via `/api/log`:

(14 events seeded: Lesson 1 trial-and-error on 1-1, smooth 1-2 with question, Lesson 2 1-shot)

### summary — has-data

```json
{"stepId":"3-1","sessionId":"snap-late-15779"}
```

>  - `<h1>` (見出しタグ)が何かを質問して理解し、自己紹介文を作ることができるようになりましたね
- 最初は失敗しましたが、ヒントをもらって `<h1>` タグを正しく使えるようになりましたね
- レッスン 1 を完了して、レッスン 2 にも進み、1 回で `<p>` (段落タグ)を正しく書くことができるようになりましたね

次は `<ul>` と `<li>` で自分の好きなものを思いっきり並べてみてください — きっと 1 回で成功しますよ！


## diagnose (どこが違う? — §9.7.2 不正解分岐)

### diagnose — Lesson 1-1 / empty (regex fails, Claude diff)

```json
{"stepId":"1-1","code":""}
```

>  こんにちは！Spark コーチです。

まだコードが空っぽですね。大丈夫、これからスタートです！

`<h1>名前</h1>` をエディタに打ち込んでみてください。`<h1>` (見出しタグ)で文字を挟むと、画面に大きく表示されますよ。やってみましょう！

### diagnose — Lesson 1-1 / unclosed tag

```json
{"stepId":"1-1","code":"<h1>名前"}
```

>  いいですね！`<h1>` の開始タグはちゃんと書けてます👍

あと一歩です。タグは**開始タグと終了タグのペア**で成り立つので、最後に `</h1>` を付け足すと完成ですよ。

修正例: `<h1>名前</h1>`

### diagnose — Lesson 4-1 / wrong selector (p instead of h1)

```json
{"stepId":"4-1","code":"<style>p{color:pink;}</style><h1>x</h1>"}
```

>  いい感じで CSS を書けていますね！ただ、惜しい点が 1 つあります。

指示では **`h1` の色を変える** ことになっていますが、今のコードは `p` (段落タグ)の色を変えてしまっています。`h1` に変えると完璧です！

修正例: `<style>h1{color:pink;}</style>`

### diagnose — Lesson 5-1 / wrong property (innerHTML)

```json
{"stepId":"5-1","code":"name.innerHTML = \"こんにちは\""}
```

>  いい感じですね!`name` に文字を書き込もうとする考え方は完璧です。

あと一歩です。ここは `innerHTML` ではなく、**`textContent`**(中身の文字を変えるもの)を使うといいですよ。修正例: `name.textContent = "こんにちは!";`

### diagnose — Lesson 1-1 / already-passing (regex true → canned, no Claude)

```json
{"stepId":"1-1","code":"<h1>名前</h1>"}
```

>  今のコードは合格パターンに当たっています!**「答え合わせする」** を押すと次のステップに進めますよ。

