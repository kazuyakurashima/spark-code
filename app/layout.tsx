import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SparkCode — HTML/CSS を楽しく学ぼう",
  description:
    "プログラミング初心者向けの HTML/CSS 学習サービス。書いた瞬間に自分のコードが画面を変える。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${notoSansJp.variable} h-full antialiased`}
    >
      {/*
       * suppressHydrationWarning is scoped to the <body> element only
       * (it doesn't propagate to children) and is the React/Next.js-
       * recommended escape hatch for browser extensions that mutate
       * <html> / <body> before hydration. Feedly Mini, Grammarly,
       * password managers, and dark-mode extensions all do this and
       * each adds noise to the dev console without indicating any
       * real bug. App-level hydration mismatches inside `{children}`
       * are still reported normally.
       */}
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
