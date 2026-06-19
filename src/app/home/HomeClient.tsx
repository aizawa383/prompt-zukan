'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  const [sort, setSort] = useState('updated_at')

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
      if (sort === 'updated_at_asc') return new Date(a.updated_at ?? 0).getTime() - new Date(b.updated_at ?? 0).getTime()
      return new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime()
    })
    return result
  }, [initialLogs, query, selectedCategory, selectedTag, selectedStatus, sort])

  function formatDate(str: string) {
    return new Date(str).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-[#EDE8F7]">

      {/* ナビ */}
      <nav className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-white/50">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#6B50B8] font-bold text-sm tracking-wide">
            <span className="text-base">✦</span>
            <span>Prompt Zukan</span>
          </div>
          <Link
            href="/logs/new"
            className="bg-[#6B50B8] hover:bg-[#5A42A0] text-white text-[12px] font-semibold px-4 py-2 rounded-full transition-colors shadow-sm"
          >
            ＋ 新規ログ
          </Link>
        </div>
      </nav>

      {/* ヒーロー */}
      <div className="text-center pt-10 pb-8 px-4">
        <h1 className="text-[36px] font-bold text-[#2D1F6E] tracking-[0.04em] leading-tight mb-2">
          プロンプト図鑑
        </h1>
        <p className="text-[10px] text-[#9B8DC4] tracking-[0.3em]">✦ MY KNOWLEDGE ZUKAN ✦</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-10">

        {/* フィルターパネル */}
        <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4B5FD] text-sm select-none">🔍</span>
            <input
              type="text" placeholder="タイトル・用途・タグで検索" value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-[#EDE8F7] rounded-xl text-sm text-[#2F2F2F] placeholder-[#C4B5FD] outline-none focus:border-[#C4B5FD] focus:ring-2 focus:ring-[#F0ECFB] transition bg-[#FAFAFE]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3 items-center">
            <span className="text-[11px] font-semibold text-[#B0A0D8] w-8 shrink-0">用途</span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_OPTIONS.map(name => {
                const active = selectedCategory === name
                const style = CATEGORY_STYLE[name as CategoryOption]
                return (
                  <button key={name} onClick={() => setSelectedCategory(active ? null : name)}
                    className={`text-[11px] px-3 py-1 rounded-full font-medium transition-all ${
                      active ? `${style.bg} ${style.text}` : 'text-[#6B7280] hover:text-[#6B50B8]'
                    }`}>
                    {name}
                  </button>
                )
              })}
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 items-center">
              <span className="text-[11px] font-semibold text-[#B0A0D8] w-8 shrink-0">タグ</span>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <button key={t.id} onClick={() => setSelectedTag(selectedTag === t.name ? null : t.name)}
                    className={`text-[11px] px-3 py-1 rounded-full font-medium transition-all ${
                      selectedTag === t.name
                        ? 'bg-[#EDE8F7] text-[#6B50B8] font-semibold'
                        : 'text-[#6B7280] hover:text-[#6B50B8]'
                    }`}>
                    #{t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 items-center pt-3 border-t border-[#F5F2FC]">
            <span className="text-[11px] font-semibold text-[#B0A0D8] w-8 shrink-0">状態</span>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_LIST.map(s => (
                <button key={s} onClick={() => setSelectedStatus(selectedStatus === s ? null : s)}
                  className={`text-[11px] px-3 py-1 rounded-full font-medium transition-all ${
                    selectedStatus === s
                      ? 'bg-[#2F2F2F] text-white font-semibold'
                      : 'text-[#6B7280] hover:text-[#2F2F2F]'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 件数 + ソート */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[#9B8DC4]">{logs.length}件の記録が見つかりました</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[#B0A0D8] text-sm">⇅</span>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="text-[12px] text-[#6B7280] bg-transparent outline-none cursor-pointer border-none">
              <option value="updated_at">更新日（新しい順）</option>
              <option value="updated_at_asc">更新日（古い順）</option>
              <option value="reuse_count">利用回数（多い順）</option>
            </select>
          </div>
        </div>

        {/* カードグリッド */}
        {logs.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-2xl mb-2 text-[#C4B5FD]">✦</p>
            <p className="text-sm text-[#B0A0D8]">まだログがありません</p>
            <p className="text-xs text-[#C4B5FD] mt-1">右上の「新規ログ」から追加できます</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {logs.map(log => (
              <Link key={log.id} href={`/logs/${log.id}`}>
                <div className="bg-white rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full flex flex-col shadow-sm">
                  {log.image_url ? (
                    <div className="w-full h-44 bg-[#F5F2FC] overflow-hidden">
                      <Image src={log.image_url} alt={log.title} width={400} height={176} className="w-full h-full object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="w-full h-3 bg-gradient-to-r from-[#C4B5FD] to-[#DDD6FE]" />
                  )}
                  <div className="px-4 pt-3.5 pb-4 flex flex-col flex-1">
                    <h2 className="text-[13px] font-bold text-[#1F1F1F] leading-snug mb-1.5">{log.title}</h2>
                    {log.purpose && (
                      <p className="text-[11px] text-[#888] mb-3 line-clamp-2 leading-relaxed">{log.purpose}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-auto mb-2">
                      <StatusBadge status={log.status} />
                      {log.categories.map((c: any) => (
                        <CategoryChip key={c.id} name={c.name} />
                      ))}
                      {log.tags.map((t: any) => (
                        <span key={t.id} className="text-[10px] border border-[#EBEBEB] text-[#B0B0B0] px-2 py-0.5 rounded">#{t.name}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-[#C4B5FD]">{formatDate(log.created_at)}</p>
                      <span className="text-[#C4B5FD] text-sm">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
