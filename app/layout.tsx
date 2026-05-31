import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"

export const metadata: Metadata = {
  title: "假装社区 — AI 内容聚合器",
  description: "个人 AI 资讯与教程聚合社区",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-white antialiased">
        {/* 顶部导航 */}
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-bold text-gray-900">
              🏘️ 假装社区
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                首页
              </Link>
              <Link href="/boards/ai-news" className="text-sm text-gray-400 hover:text-gray-600">
                AI 资讯
              </Link>
              <Link href="/boards/ai-tutorials" className="text-sm text-gray-400 hover:text-gray-600">
                AI 教程
              </Link>
              <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">
                管理
              </Link>
            </div>
          </nav>
        </header>

        {/* 主内容区 */}
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
