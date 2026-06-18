import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'プロンプト図鑑',
  description: '自分だけの知識図鑑',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'プロンプト図鑑',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F8F7F4',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-[#F8F7F4] antialiased">{children}</body>
    </html>
  )
}
