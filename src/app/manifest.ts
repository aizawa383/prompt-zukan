import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'プロンプト図鑑',
    short_name: '図鑑',
    description: '自分だけのプロンプト学習ログ',
    start_url: '/home',
    display: 'standalone',
    background_color: '#F8F7F4',
    theme_color: '#F8F7F4',
    orientation: 'portrait',
    lang: 'ja',
    icons: [
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
