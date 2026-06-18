export type Status = '未使用' | '試した' | '活用済'

export const STATUS_LIST: Status[] = ['未使用', '試した', '活用済']

export const STATUS_STYLE: Record<Status, { label: string; bg: string; text: string; dot: string }> = {
  未使用: { label: '未使用', bg: 'bg-gray-100',   text: 'text-gray-500',   dot: 'bg-gray-400' },
  試した: { label: '試した', bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  活用済: { label: '活用済', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
}

export const CATEGORY_OPTIONS = ['画像生成', 'Web制作', 'デザイン', '文章作成', 'AI活用', '案件獲得', 'ブランディング', '仕事術', 'その他'] as const
export type CategoryOption = typeof CATEGORY_OPTIONS[number]

export const CATEGORY_STYLE: Record<CategoryOption, { bg: string; text: string }> = {
  画像生成:     { bg: 'bg-[#EDD9F5]', text: 'text-[#7B4F8A]' },
  Web制作:      { bg: 'bg-[#C2EDEA]', text: 'text-[#2E8B84]' },
  デザイン:     { bg: 'bg-[#FFD6E0]', text: 'text-[#C0485E]' },
  文章作成:     { bg: 'bg-[#FFE8C8]', text: 'text-[#B06000]' },
  AI活用:       { bg: 'bg-[#D4EFE0]', text: 'text-[#2D7A4F]' },
  案件獲得:     { bg: 'bg-[#FFF5C2]', text: 'text-[#8B7000]' },
  ブランディング: { bg: 'bg-[#E8D8F8]', text: 'text-[#6B3FA0]' },
  仕事術:       { bg: 'bg-[#D6EEFF]', text: 'text-[#1E6FA8]' },
  その他:       { bg: 'bg-[#E8E8E8]', text: 'text-[#5A5A5A]' },
}

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
