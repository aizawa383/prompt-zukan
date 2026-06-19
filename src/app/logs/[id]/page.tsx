import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { incrementReuse, recordView } from '@/app/actions'
import CategoryChip from '@/components/CategoryChip'
import DeleteButton from '@/components/DeleteButton'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Target, FileText, Copy, BookOpen, Link2, Pencil, RotateCcw } from 'lucide-react'
import CopyButton from '@/components/CopyButton'

export default async function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: log } = await supabase.from('logs').select(`
    *,
    log_categories(categories(id, name)),
    log_tags(tags(id, name)),
    reference_urls(*)
  `).eq('id', id).eq('user_id', user.id).single()

  if (!log) notFound()

  void recordView(id)

  const categories = log.log_categories?.map((lc: any) => lc.categories).filter(Boolean) ?? []
  const tags = log.log_tags?.map((lt: any) => lt.tags).filter(Boolean) ?? []
  const urls = log.reference_urls ?? []

  function formatDate(str: string | null) {
    if (!str) return '—'
    return new Date(str).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const statusColor: Record<string, string> = {
    '未使用': 'bg-[#F3F4F6] text-[#6B7280]',
    '試した': 'bg-[#EDE8F7] text-[#6B50B8]',
    '活用済': 'bg-[#D1FAE5] text-[#065F46]',
  }

  return (
    <div className="min-h-screen bg-[#F5F2FB]">

      {/* ナビ */}
      <nav className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-white/50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-1.5 text-[#6B50B8] text-sm font-medium hover:opacity-70 transition">
            <ArrowLeft size={16} />
            <span>Prompt Zukan</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto pb-24">

        {/* ヒーロー画像 or ヘッダー */}
        {log.image_url ? (
          <div className="relative w-full h-64 sm:h-80 overflow-hidden">
            <Image src={log.image_url} alt={log.title} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {categories.map((c: any) => (
                  <CategoryChip key={c.id} name={c.name} />
                ))}
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColor[log.status] ?? 'bg-white/20 text-white'}`}>
                  {log.status}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">{log.title}</h1>
            </div>
          </div>
        ) : (
          <div className="px-4 pt-8 pb-4">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {categories.map((c: any) => (
                <CategoryChip key={c.id} name={c.name} />
              ))}
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColor[log.status] ?? 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                {log.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2D1F6E] leading-snug">{log.title}</h1>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t: any) => (
                  <span key={t.id} className="text-[11px] border border-[#DDD6FE] text-[#9B8DC4] px-2 py-0.5 rounded">#{t.name}</span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="px-4 pt-4 space-y-3">

          {/* やりたかったこと */}
          {log.purpose && (
            <Section icon={<Target size={15} className="text-[#9B8DC4]" />} title="やりたかったこと">
              <p className="text-sm text-[#2F2F2F] leading-relaxed">{log.purpose}</p>
            </Section>
          )}

          {/* プロンプト本文 */}
          {log.prompt_body && (
            <Section icon={<FileText size={15} className="text-[#9B8DC4]" />} title="プロンプト本文"
              action={<CopyButton text={log.prompt_body} />}>
              <pre className="text-xs text-[#2F2F2F] font-mono bg-[#F8F6FF] rounded-xl p-4 whitespace-pre-wrap leading-relaxed border border-[#EDE8F7]">
                {log.prompt_body}
              </pre>
              {log.result && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-[#9B8DC4] mb-1.5">実行結果</p>
                  <p className="text-sm text-[#2F2F2F] whitespace-pre-wrap leading-relaxed">{log.result}</p>
                </div>
              )}
            </Section>
          )}

          {/* 学習メモ */}
          {log.memo && (
            <Section icon={<BookOpen size={15} className="text-[#9B8DC4]" />} title="学習メモ">
              <p className="text-sm text-[#2F2F2F] whitespace-pre-wrap leading-relaxed">{log.memo}</p>
            </Section>
          )}

          {/* 補足メモ */}
          {log.supplement && (
            <Section icon={<BookOpen size={15} className="text-[#9B8DC4]" />} title="補足メモ">
              <p className="text-sm text-[#2F2F2F] whitespace-pre-wrap leading-relaxed">{log.supplement}</p>
            </Section>
          )}

          {/* 参考元・資料 */}
          {(log.source || urls.length > 0) && (
            <Section icon={<Link2 size={15} className="text-[#9B8DC4]" />} title="参考元・資料">
              {log.source && <p className="text-sm text-[#2F2F2F] mb-2">{log.source}</p>}
              {urls.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {urls.map((u: any) => (
                    <a key={u.id} href={u.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-start gap-2 bg-[#F8F6FF] hover:bg-[#EDE8F7] border border-[#EDE8F7] rounded-xl px-3 py-2.5 transition group">
                      <Link2 size={13} className="text-[#9B8DC4] mt-0.5 shrink-0" />
                      <span className="text-xs text-[#6B50B8] group-hover:underline break-all leading-relaxed">
                        {u.label || u.url}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* 再利用 + 記録 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <form action={incrementReuse.bind(null, id)}>
              <button type="submit"
                className="flex items-center gap-2 text-sm text-[#9B8DC4] hover:text-[#6B50B8] transition">
                <RotateCcw size={14} />
                再利用した（{log.reuse_count}回）
              </button>
            </form>
            <div className="text-xs text-[#C4B5FD] space-y-0.5 pt-2 border-t border-[#F5F2FC]">
              <p>作成日：{formatDate(log.created_at)}</p>
              <p>更新日：{formatDate(log.updated_at)}</p>
            </div>
            <div className="pt-1">
              <DeleteButton id={id} />
            </div>
          </div>

        </div>
      </div>

      {/* 浮かぶ編集ボタン */}
      <Link href={`/logs/${id}/edit`}
        className="fixed bottom-6 right-5 w-12 h-12 bg-[#6B50B8] hover:bg-[#5A42A0] text-white rounded-full flex items-center justify-center shadow-lg transition z-20">
        <Pencil size={18} />
      </Link>

    </div>
  )
}

function Section({ icon, title, action, children }: {
  icon: React.ReactNode
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {icon}
          <p className="text-sm font-semibold text-[#6B50B8]">{title}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
