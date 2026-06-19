import type { Metadata, Viewport } from 'next'
import './globals.css'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: 'プロンプト図鑑',
  description: '自分だけの知識図鑑',
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
  themeColor: '#EDE8F7',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-[#F8F7F4] antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
