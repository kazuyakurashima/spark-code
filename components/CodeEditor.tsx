"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";

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
  /** Defaults to "html" — switches the syntax mode for Lesson 5 onward. */
  language?: "html" | "javascript";
};

const DEFAULT_PLACEHOLDER: Record<NonNullable<Props["language"]>, string> = {
  html: "ここに HTML を書いてみよう",
  javascript: "ここに JavaScript を書いてみよう",
};

export function CodeEditor({
  value,
  onChange,
  placeholder,
  language = "html",
}: Props) {
  const extensions = useMemo<Extension[]>(
    () => [
      language === "javascript" ? javascript() : html(),
      EditorView.lineWrapping,
    ],
    [language],
  );
  return (
    <div className="h-full overflow-hidden">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        theme={oneDark}
        height="100%"
        placeholder={placeholder ?? DEFAULT_PLACEHOLDER[language]}
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
