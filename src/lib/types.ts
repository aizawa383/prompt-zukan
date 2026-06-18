export type Status = '未使用' | '試した' | '活用済'

export const STATUS_LIST: Status[] = ['未使用', '試した', '活用済']

export const STATUS_STYLE: Record<Status, { label: string; bg: string; text: string }> = {
  未使用: { label: '未使用', bg: 'bg-gray-100',  text: 'text-gray-500' },
  試した: { label: '試した', bg: 'bg-blue-100',  text: 'text-blue-600' },
  活用済: { label: '活用済', bg: 'bg-green-100', text: 'text-green-600' },
}

export const CATEGORY_OPTIONS = ['画像生成', 'Web制作', 'デザイン', '文章作成', 'AI活用', '案件獲得', 'ブランディング', '仕事術', 'その他'] as const

export type Log = {
  id: string
  user_id: string
  title: string
  purpose: string | null
  prompt_body: string | null
  result: string | null
  memo: string | null
  supplement: string | null
  insights: string | null
  reuse_points: string | null
  ideas: string | null
  source: string | null
  status: Status
  reuse_count: number
  last_viewed_at: string | null
  created_at: string
  updated_at: string
  categories?: { id: string; name: string }[]
  tags?: { id: string; name: string }[]
  reference_urls?: { id: string; url: string; label: string | null }[]
}

export type Tag = { id: string; name: string }
