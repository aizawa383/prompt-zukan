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

      {/* ヘッダー */}
      <nav className="bg-white border-b border-[#EBEBEB] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 py-0">
          <div className="flex items-center justify-between h-14">
            <Link href="/history" className="text-[11px] text-[#B0B0B0] hover:text-[#6B7280] transition-colors whitespace-nowrap">
              閲覧履歴
            </Link>
            <div className="text-center px-4">
              <h1 className="text-[15px] font-bold text-[#2F2F2F] tracking-[0.06em] leading-none">プロンプト図鑑</h1>
              <p className="text-[9px] text-[#C4B5FD] tracking-[0.28em] leading-none mt-1">✦ MY KNOWLEDGE ZUKAN ✦</p>
            </div>
            <Link href="/logs/new" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[11px] font-semibold px-4 py-1.5 rounded-md transition-colors whitespace-nowrap">
              ＋ 新規ログ
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 pt-5 pb-8">

        {/* 検索・フィルター */}
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-4 mb-5">
          <div className="relative mb-3.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4B5FD] text-sm select-none">✦</span>
            <input
              type="text" placeholder="タイトル・用途・タグで検索" value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#2F2F2F] placeholder-[#C0C0C0] outline-none focus:border-[#C4B5FD] focus:ring-1 focus:ring-[#EDE9FE] transition bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3 items-center">
            <span className="text-[10px] font-semibold text-[#C0C0C0] tracking-wide mr-0.5">用途</span>
            {CATEGORY_OPTIONS.map(name => {
              const active = selectedCategory === name
              const style = CATEGORY_STYLE[name as CategoryOption]
              return (
                <button key={name} onClick={() => setSelectedCategory(active ? null : name)}
                  className={`text-[11px] px-2.5 py-0.5 rounded font-medium transition-all border ${
                    active ? `${style.bg} ${style.text} border-transparent` : 'bg-transparent text-[#A0A0A0] border-[#E8E8E8] hover:border-[#C4B5FD] hover:text-[#7C3AED]'
                  }`}>
                  {name}
                </button>
              )
            })}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 items-center">
              <span className="text-[10px] font-semibold text-[#C0C0C0] tracking-wide mr-0.5">タグ</span>
              {tags.map(t => (
                <button key={t.id} onClick={() => setSelectedTag(selectedTag === t.name ? null : t.name)}
                  className={`text-[11px] px-2.5 py-0.5 rounded border transition-all ${
                    selectedTag === t.name
                      ? 'border-[#7C3AED] text-[#7C3AED] bg-[#F5F3FF] font-semibold'
                      : 'border-[#E8E8E8] text-[#A0A0A0] hover:border-[#C4B5FD] hover:text-[#7C3AED]'
                  }`}>
                  #{t.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 items-center pt-3 border-t border-[#F3F3F3]">
            <span className="text-[10px] font-semibold text-[#C0C0C0] tracking-wide mr-0.5">状態</span>
            {STATUS_LIST.map(s => (
              <button key={s} onClick={() => setSelectedStatus(selectedStatus === s ? null : s)}
                className={`text-[11px] px-2.5 py-0.5 rounded border transition-all ${
                  selectedStatus === s
                    ? 'bg-[#2F2F2F] border-[#2F2F2F] text-white font-semibold'
                    : 'border-[#E8E8E8] text-[#A0A0A0] hover:border-[#9CA3AF] hover:text-[#2F2F2F]'
                }`}>
                {s}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1.5">
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="text-[11px] border border-[#E8E8E8] rounded px-2 py-0.5 outline-none text-[#A0A0A0] bg-white hover:border-[#C4B5FD] transition cursor-pointer">
                <option value="created_at">作成日順</option>
                <option value="updated_at">更新日順</option>
                <option value="reuse_count">再利用回数順</option>
                <option value="last_viewed_at">最終閲覧順</option>
              </select>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[#C0C0C0] mb-3 tracking-wide">{logs.length} 件</p>

        {logs.length === 0 ? (
          <div className="text-center py-24 text-[#D1D5DB]">
            <p className="text-2xl mb-2 text-[#E9D5FF]">✦</p>
            <p className="text-sm text-[#C0C0C0]">まだログがありません</p>
            <p className="text-xs text-[#D1D5DB] mt-1">右上の「新規ログ」から追加できます</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {logs.map(log => {
              const firstCat = log.categories[0]?.name as CategoryOption | undefined
              const accentColor = firstCat ? CATEGORY_STYLE[firstCat]?.bg.replace('bg-[', '').replace(']', '') : '#EBEBEB'
              return (
                <Link key={log.id} href={`/logs/${log.id}`}>
                  <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden hover:shadow-sm hover:-translate-y-px transition-all cursor-pointer h-full flex flex-col">
                    {/* 用途カラーの上ライン */}
                    <div style={{ height: '3px', background: accentColor }} />
                    <div className="px-4 pt-3.5 pb-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h2 className="text-[13px] font-semibold text-[#1F1F1F] leading-snug flex-1">{log.title}</h2>
                        {log.reuse_count > 0 && (
                          <span className="text-[10px] text-[#C0C0C0] whitespace-nowrap mt-0.5">♻ {log.reuse_count}</span>
                        )}
                      </div>
                      {log.purpose && (
                        <p className="text-[11px] text-[#888] mb-3 line-clamp-2 leading-relaxed">{log.purpose}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-auto">
                        <StatusBadge status={log.status} />
                        {log.categories.map((c: any) => (
                          <CategoryChip key={c.id} name={c.name} />
                        ))}
                        {log.tags.map((t: any) => (
                          <span key={t.id} className="text-[10px] border border-[#EBEBEB] text-[#B0B0B0] px-2 py-0.5 rounded">#{t.name}</span>
                        ))}
                      </div>
                      <p className="text-[10px] text-[#D0D0D0] mt-2.5">{formatDate(log.created_at)}</p>
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
