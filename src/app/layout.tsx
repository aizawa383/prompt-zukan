import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'プロンプト図鑑',
  description: '自分だけの知識図鑑',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-[#fafafa] antialiased">{children}</body>
    </html>
  )
}
