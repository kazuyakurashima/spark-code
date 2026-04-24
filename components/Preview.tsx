"use client";

type Props = {
  code: string;
  previewCss: string;
};

function buildSrcDoc(code: string, previewCss: string): string {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>preview</title>
<style>${previewCss}</style>
</head>
<body>
${code}
</body>
</html>`;
}

export function Preview({ code, previewCss }: Props) {
  const srcDoc = buildSrcDoc(code, previewCss);
  return (
    <iframe
      srcDoc={srcDoc}
      sandbox=""
      title="preview"
      className="w-full h-full border-0 bg-white block"
    />
  );
}
