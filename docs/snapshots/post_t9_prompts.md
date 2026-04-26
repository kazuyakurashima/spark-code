# Baseline prompt outputs (pre-T9)

Captured: 2026-04-26T14:26:36Z
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

>  完璧です！`<h1>` (見出しタグ)の開始タグと終了タグの形をしっかり理解できていますね。開始タグ `<h1>` と終了タグ `</h1>` で「名前」をきちんと挟めています。

### judge — Lesson 1-2, correct (<h1>かず</h1>)

```json
{"stepId":"1-2","code":"<h1>かず</h1>"}
```

>  素晴らしい！`<h1>` タグで自分の名前「かず」をちゃんと見出しとして表示できました。コードと画面の変化がリンクしている感覚、つかめてきたんじゃないかな。

### judge — Lesson 1-1, incorrect (empty)

```json
{"stepId":"1-1","code":""}
```

>  おしい!もう一度コードを見直してみよう。タグの形やつづりに気をつけて。

### judge — Lesson 4-1, correct (<style>h1{color:pink;}</style>)

```json
{"stepId":"4-1","code":"<style>h1{color:pink;}</style><h1>x</h1>"}
```

>  完璧です！`h1` (見出しタグ) の色を `color: pink;` で変えられました。スペースを詰めた書き方も、ちゃんと動く CSS として素晴らしいですね。

### judge — Lesson 5-1, correct (name.textContent assignment)

```json
{"stepId":"5-1","code":"name.textContent = \"こんにちは!\""}
```

>  完璧です!`textContent`で画面の文字を書き換えることができました。セミコロン(;)もちゃんと付いていて、JavaScript の基本がしっかり身についていますね。


## hint

### hint — Lesson 1-1, empty editor

```json
{"stepId":"1-1","code":""}
```

>  こんにちは！プログラミング、一緒に頑張りましょう 😊

エディタが空っぽなんですね。では、まず **`<h1>`（見出しタグ）の開始タグを書いてみましょう**。

例えば `<h1>` こんな形です。次は、その後ろに自分の名前を入れてみてください！

### hint — Lesson 1-1, partial (<h1)

```json
{"stepId":"1-1","code":"<h1"}
```

>  いいスタート！`<h1` まで書けてますね 👍

次は、開始タグを閉じる `>` を付けてみましょう。

### hint — Lesson 4-1, no <style>

```json
{"stepId":"4-1","code":"<h1>かず</h1>"}
```

>  こんにちは！まず、`<h1>` タグ(見出しタグ)がちゃんと書けてるのいいですね👍

では次のステップ：`<h1>` の **上に** `<style>` タグを書いて、その中に `h1 { color: 色の名前; }` を入れてみましょう。

### hint — Lesson 5-1, wrong property (innerHTML)

```json
{"stepId":"5-1","code":"name.innerHTML = \"こんにちは\""}
```

>  いいですね、もう JavaScript を書き始めてる!惜しいところが 1 つあります。

指示では `textContent` を使うことになってるんですが、今書いてるのは `innerHTML` になってますね。次に、`.innerHTML` の部分を `.textContent` に変えてみましょう。


## praise

### praise — Lesson 1-1 success

```json
{"stepId":"1-1","code":"<h1>名前</h1>"}
```

>  ばっちりですね！`<h1>` タグの形をもう理解してる 🎉

### praise — Lesson 1-2 success (custom name)

```json
{"stepId":"1-2","code":"<h1>かず</h1>"}
```

>  かずさんの名前がしっかり見出しに表示されましたね！`<h1>` (見出しタグ)でコードと画面がつながるのを感じられたと思います。

### praise — Lesson 4-1 success (color change)

```json
{"stepId":"4-1","code":"<style>h1{color:pink;}</style><h1>x</h1>"}
```

>  ピンク色、素敵ですね！`<style>` タグの中に `color: pink;` と書いて、見出しの色がちゃんと変わりました 🎨

### praise — Lesson 5-1 success (textContent)

```json
{"stepId":"5-1","code":"name.textContent = \"こんにちは!\""}
```

>  いいですね!`textContent`（テキストコンテンツ = 文字の内容）を使って、画面の文字が「こんにちは!」に変わりましたね。JavaScript の力を感じられたと思います 🎉


## question

### question — Lesson 1-1: what is <h1>?

```json
{"stepId":"1-1","code":"","question":"<h1> って何ですか?"}
```

>  いい質問ですね！`<h1>` は**見出しタグ**といって、ページで一番大きく・目立つ文字を表示するためのタグです。

新聞の大見出しみたいなイメージ。例えば `<h1>田中太郎</h1>` と書くと、「田中太郎」が大きく太く表示されるんですよ。

では、エディタに `<h1>名前</h1>` と打ち込んで、実際に見てみましょう！

### question — Lesson 4-1: what is style?

```json
{"stepId":"4-1","code":"<h1>x</h1>","question":"<style> ってどういう意味?"}
```

>  いい質問ですね！`<style>` タグ（スタイルタグ）は、**ページ全体の見た目ルールを書く場所**のことです。

たとえば、`<style>` の中に `h1 { color: red; }` と書くと、「このページの全ての `<h1>` （見出しタグ）を赤くしてね」という指示になります。HTML で形を作って、`<style>` で色や大きさを決める、という感じです！

あなたのコードなら、`<h1>x</h1>` の上に `<style>h1 { color: pink; }</style>` を書くと、「x」がピンク色になりますよ。試してみましょう！

### question — Lesson 5-1: what is textContent?

```json
{"stepId":"5-1","code":"","question":"textContent って何?"}
```

>  いい質問ですね!`textContent` は、**「要素の中身の文字を読んだり、書き換えたりするための道具」** だと思ってください。

例えば、画面に `<h1>` タグがあって「Hello」って書いてあるとします。
```js
name.textContent = "さようなら";
```
この 1 行を実行すると、「Hello」が「さようなら」に変わっちゃう ✨

つまり `textContent` は、**「その要素の文字を操作する魔法の手**」みたいなものです。まずはエディタに書いて、実際に動かしてみると、すごくわかりやすいですよ!

### question — generic: I am stuck

```json
{"stepId":"2-1","code":"<h1>かず</h1>","question":"うまく書けないです"}
```

>  そっか、うまくいかないんですね。大丈夫、一緒に見てみましょう！😊

いまのコードを見ると、`<h1>` タグ（見出しタグ）はちゃんと書けてますね。あと一歩です。

`<h1>かず</h1>` の **下の行に**、`<p>` タグで自己紹介を足すイメージです。例えば：
```
<h1>かず</h1>
<p>プログラミングが好きです</p>
```

どこで詰まってますか？タグの書き方ですか、それとも下の行に追加する方法ですか？教えてくれたら、もっと詳しく説明しますよ！

