import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import ErrorBoundary from "./components/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CLEAN-THE-SEA",
  description: "海洋プラスチック汚染データの可視化・データ収集・クレジット取引ポータル",
};

const navLinks = [
  { href: "/dashboard", label: "ダッシュボード" },
  { href: "/contribute", label: "データ投稿" },
  { href: "/mypage", label: "マイページ" },
  { href: "/credits", label: "クレジット" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="bg-blue-700 text-white shadow-md">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-xl font-bold tracking-tight min-h-[44px] inline-flex items-center">
                🌊 CLEAN-THE-SEA
              </Link>
              <ul className="flex space-x-1 sm:space-x-4">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors min-w-[44px] min-h-[44px] inline-flex items-center"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </header>
        <main className="flex-1">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </body>
    </html>
  );
}
