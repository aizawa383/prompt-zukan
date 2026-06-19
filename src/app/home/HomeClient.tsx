'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import CategoryChip from '@/components/CategoryChip'
import { Status, STATUS_LIST, CATEGORY_OPTIONS, CATEGORY_STYLE, CategoryOption } from '@/lib/types'

type Props = {
  initialLogs: any[]
  categories: { id: string; name: string }[]
  tags: { id: string; name: string }[]
}

export default function HomeClient({ initialLogs, categories, tags }: Props) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null)
  const [sort, setSort] = useState('created_at')

  const logs = useMemo(() => {
    let result = initialLogs.map(log => ({
      ...log,
      categories: log.log_categories?.map((lc: any) => lc.categories).filter(Boolean) ?? [],
      tags: log.log_tags?.map((lt: any) => lt.tags).filter(Boolean) ?? [],
    }))

    if (query) {
      const q = query.toLowerCase()
      result = result.filter(log =>
        [log.title, log.purpose, log.prompt_body, log.result,
          log.memo, log.supplement,
          ...log.tags.map((t: any) => t.name),
          ...log.categories.map((c: any) => c.name),
        ].some(v => v?.toLowerCase().includes(q))
      )
    }
    if (selectedCategory) result = result.filter(log => log.categories.some((c: any) => c.name === selectedCategory))
    if (selectedTag) result = result.filter(log => log.tags.some((t: any) => t.name === selectedTag))
    if (selectedStatus) result = result.filter(log => log.status === selectedStatus)

    result.sort((a, b) => {
      if (sort === 'reuse_count') return b.reuse_count - a.reuse_count
      return new Date(b[sort] ?? 0).getTime() - new Date(a[sort] ?? 0).getTime()
    })
    return result
  }, [initialLogs, query, selectedCategory, selectedTag, selectedStatus, sort])

  function formatDate(str: string) {
    return new Date(str).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">

      {/* ヘッダー：C案タイトル ＋ ナビボタン */}
      <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/history" className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition min-w-[60px]">閲覧履歴</Link>
          <div className="text-center">
            <p className="text-[10px] text-[#C4B5FD] tracking-[0.4em] leading-tight">✦ ✦ ✦</p>
            <h1 className="text-base font-bold text-[#2F2F2F] tracking-wide leading-tight">プロンプト図鑑</h1>
            <p className="text-[9px] text-[#9CA3AF] tracking-widest leading-tight">— 自分だけの知識図鑑 —</p>
          </div>
          <Link href="/logs/new" className="bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition shadow-sm min-w-[60px] text-center">
            ＋ 新規
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* 検索・フィルター：A案 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-6 shadow-sm">
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">🔍</span>
            <input
              type="text" placeholder="キーワードで検索…" value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-full text-sm text-[#2F2F2F] placeholder-[#9CA3AF] outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-3 items-center">
            <span className="text-xs font-semibold text-[#9CA3AF] mr-1">用途</span>
            {CATEGORY_OPTIONS.map(name => {
              const active = selectedCategory === name
              const style = CATEGORY_STYLE[name as CategoryOption]
              return (
                <button key={name} onClick={() => setSelectedCategory(active ? null : name)}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition border ${
                    active ? `${style.bg} ${style.text} border-transparent` : 'bg-white text-[#9CA3AF] border-[#E5E7EB] hover:border-[#D1D5DB]'
                  }`}>
                  {name}
                </button>
              )
            })}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 items-center">
              <span className="text-xs font-semibold text-[#9CA3AF] mr-1">タグ</span>
              {tags.map(t => (
                <button key={t.id} onClick={() => setSelectedTag(selectedTag === t.name ? null : t.name)}
                  className={`text-xs px-2.5 py-0.5 rounded-full border transition ${selectedTag === t.name ? 'border-[#6B7280] text-[#2F2F2F] bg-[#F9FAFB] font-semibold' : 'border-[#E5E7EB] text-[#9CA3AF] hover:border-[#D1D5DB]'}`}>
                  # {t.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center pt-3 border-t border-[#F3F4F6]">
            <span className="text-xs font-semibold text-[#9CA3AF] mr-1">状態</span>
            {STATUS_LIST.map(s => (
              <button key={s} onClick={() => setSelectedStatus(selectedStatus === s ? null : s)}
                className={`text-xs px-3 py-1 rounded-full border font-medium transition ${selectedStatus === s ? 'bg-[#2F2F2F] border-[#2F2F2F] text-white' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'}`}>
                {s}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-[#9CA3AF]">並び順</span>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="text-xs border border-[#E5E7EB] rounded-lg px-2 py-1 outline-none text-[#6B7280] bg-white">
                <option value="created_at">作成日（新しい順）</option>
                <option value="updated_at">更新日（新しい順）</option>
                <option value="reuse_count">再利用回数（多い順）</option>
                <option value="last_viewed_at">最終閲覧（新しい順）</option>
              </select>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#9CA3AF] mb-4 font-medium">{logs.length} 件</p>

        {logs.length === 0 ? (
          <div className="text-center py-20 text-[#D1D5DB]">
            <p className="text-3xl mb-3">✦</p>
            <p className="text-sm">ログがまだありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {logs.map(log => {
              const firstCat = log.categories[0]?.name as CategoryOption | undefined
              const accentColor = firstCat ? CATEGORY_STYLE[firstCat]?.bg.replace('bg-[', '').replace(']', '') : '#E5E7EB'
              return (
                <Link key={log.id} href={`/logs/${log.id}`}>
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full flex flex-col">
                    {/* A案：用途カラーの上ライン */}
                    <div style={{ height: '3px', background: accentColor }} />
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h2 className="text-sm font-bold text-[#2F2F2F] leading-snug flex-1">{log.title}</h2>
                        {log.reuse_count > 0 && (
                          <span className="text-xs text-[#9CA3AF] whitespace-nowrap">♻ {log.reuse_count}</span>
                        )}
                      </div>
                      {log.purpose && <p className="text-xs text-[#6B7280] mb-3 line-clamp-2">{log.purpose}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        <StatusBadge status={log.status} />
                        {log.categories.map((c: any) => (
                          <CategoryChip key={c.id} name={c.name} />
                        ))}
                        {log.tags.map((t: any) => (
                          <span key={t.id} className="text-xs border border-[#E5E7EB] text-[#9CA3AF] px-2 py-0.5 rounded-full"># {t.name}</span>
                        ))}
                      </div>
                      <p className="text-xs text-[#D1D5DB] mt-3">{formatDate(log.created_at)}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
