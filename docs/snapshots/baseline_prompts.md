# Baseline prompt outputs (pre-T9)

Captured: 2026-04-26T14:22:38Z
Model: claude-haiku-4-5 (alias)
Endpoint: `POST /api/chat` (current prompts.ts as of pre-T9)

Each scenario shows the request body and the assistant's `message`
field. Used to sanity-check that the T9 voice update is in the
same neighborhood as today's output.

---

## judge (incorrect cases run regex first; correct cases reach Claude)

### judge — Lesson 1-1, correct (<h1>名前</h1>)

```json
{"stepId":"1-1","code":"<h1>名前</h1>"}
```

>  完璧です!タグの開始と終了がちゃんと揃ってますね。これがHTMLの基本形なので、ここからどんどん応用できますよ!

### judge — Lesson 1-2, correct (<h1>かず</h1>)

```json
{"stepId":"1-2","code":"<h1>かず</h1>"}
```

>  完璧です!「かず」という名前がちゃんと画面に表示されましたね。コードを変えると画面がすぐ反応する感覚、つかめてきたと思います!

### judge — Lesson 1-1, incorrect (empty)

```json
{"stepId":"1-1","code":""}
```

>  おしい!もう一度コードを見直してみよう。タグの形やつづりに気をつけて。

### judge — Lesson 4-1, correct (<style>h1{color:pink;}</style>)

```json
{"stepId":"4-1","code":"<style>h1{color:pink;}</style><h1>x</h1>"}
```

>  完璧です!スペースを詰めてコンパクトに書くのもいいテクニック。h1の色がちゃんとピンクに変わってますね。

### judge — Lesson 5-1, correct (name.textContent assignment)

```json
{"stepId":"5-1","code":"name.textContent = \"こんにちは!\""}
```

>  完璧です!JavaScript で画面の文字を変える基本ができました。セミコロン(;)がなくても動きますが、習慣として付けるといいですよ。


## hint

### hint — Lesson 1-1, empty editor

```json
{"stepId":"1-1","code":""}
```

>  まず一歩目ですね！大丈夫、簡単ですよ。

エディタの空白に、指示文に書いてある通り `<h1>` で始まって `</h1>` で終わる、その中に「名前」という文字を入れるイメージで、そのまま打ってみてください。

### hint — Lesson 1-1, partial (<h1)

```json
{"stepId":"1-1","code":"<h1"}
```

>  いいスタート!開始タグの `<h1` まできちんと書けてますね。あと、`>` で開始タグを閉じて、その後に `名前` と続けてみましょう。

### hint — Lesson 4-1, no <style>

```json
{"stepId":"4-1","code":"<h1>かず</h1>"}
```

>  いい質問ですね！今のコードには `<h1>` のタグがありますが、色を変えるルールはどこに書くんでしたっけ？**`<style>` タグの中**に CSS を書く場所があると思うんですが、そこを確認してみてください。

### hint — Lesson 5-1, wrong property (innerHTML)

```json
{"stepId":"5-1","code":"name.innerHTML = \"こんにちは\""}
```

>  いい感じ!あと一歩です。指示文をもう一度見てみると、使う言葉が 2 つありますね — `textContent` と `innerHTML` のどちらを使うか、確認してみましょう。


## praise

### praise — Lesson 1-1 success

```json
{"stepId":"1-1","code":"<h1>名前</h1>"}
```

>  完璧です！🎉タグの形をきちんと理解できてますね。次のステップへ進みましょう。

### praise — Lesson 1-2 success (custom name)

```json
{"stepId":"1-2","code":"<h1>かず</h1>"}
```

>  かずさんの名前がちゃんと画面に表示されてますね！コードを変えるとプレビューもすぐ変わるのが見えたでしょ？👍

### praise — Lesson 4-1 success (color change)

```json
{"stepId":"4-1","code":"<style>h1{color:pink;}</style><h1>x</h1>"}
```

>  いいね!`h1` を `pink` に変えるルールがちゃんと書けてる。スタイルも効いてますね 🎨

### praise — Lesson 5-1 success (textContent)

```json
{"stepId":"5-1","code":"name.textContent = \"こんにちは!\""}
```

>  わあ、完璧です!🎉 `name.textContent = "こんにちは!"` ちゃんと書けちゃった。これで画面の文字が変わる魔法が動いてますよ。


## question

### question — Lesson 1-1: what is <h1>?

```json
{"stepId":"1-1","code":"","question":"<h1> って何ですか?"}
```

>  いい質問だね！`<h1>` は「見出し」を作るタグなんだ。新聞の大きな記事タイトルみたいに、ページの中で一番大事な文字を大きく目立たせるためのものだよ。

今はまず「タグの形に慣れる」ことが目的だから、深く考えずに `<h1>名前</h1>` をエディタに書いてみてね。そうするとどんな風に表示されるか、実際に見てみようか！

### question — Lesson 4-1: what is style?

```json
{"stepId":"4-1","code":"<h1>x</h1>","question":"<style> ってどういう意味?"}
```

>  いい質問だね！`<style>` は、ページ全体の **見た目を変えるルール** を書く場所だと思ってください。

`<h1>` が「見出しの文字を表示する」という役割なら、`<style>` は「その見出しを何色にするか、どのくらい大きくするか」みたいな **装飾のルール** を書く場所です。

HTML ファイルの `<head>` という場所に `<style>` を書くと、ページ全体に反映されるんですよ。まずは色を変えてみて、実際に試してみるのが一番わかりやすいと思います！

### question — Lesson 5-1: what is textContent?

```json
{"stepId":"5-1","code":"","question":"textContent って何?"}
```

>  いい質問だね!`textContent` は、**画面に表示されている文字を操作するための道具**だと思ってください。

例えるなら、`<h1>` というボックスの中身を「消しゴムで消して、新しく書き直す」みたいなイメージです。`name.textContent = "こんにちは!";` と書くと、元の文字が消えて「こんにちは!」に変わっちゃう、ってわけですよ。

難しく考えず、「文字を変えるための魔法の言葉」くらいに覚えておけば大丈夫!😊

### question — generic: I am stuck

```json
{"stepId":"2-1","code":"<h1>かず</h1>","question":"うまく書けないです"}
```

>  そっか、うまくいかないんだね。大丈夫！一緒に見てみましょう。

今のコードを見ると、名前の `<h1>かず</h1>` はいい感じです。その下に、`<p>` を使って自己紹介を1行足すだけですよ。

例えば、こんな感じ：
```html
<h1>かず</h1>
<p>ここに自分の自己紹介を書く</p>
```

「ここに自分の自己紹介を書く」の部分を、あなたの自己紹介に変えてみてください。どんなことを書きたいですか？

