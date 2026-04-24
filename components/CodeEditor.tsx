"use client";

import dynamic from "next/dynamic";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";

// CodeMirror 6 touches the DOM during render, so we disable SSR.
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => (
    <div className="h-full grid place-items-center text-slate-500 text-sm">
      エディタを読み込み中…
    </div>
  ),
});

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function CodeEditor({ value, onChange, placeholder }: Props) {
  return (
    <div className="h-full overflow-hidden">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[html(), EditorView.lineWrapping]}
        theme={oneDark}
        height="100%"
        placeholder={placeholder ?? "ここに HTML を書いてみよう"}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          foldGutter: false,
          autocompletion: false,
        }}
        className="h-full text-base"
      />
    </div>
  );
}
