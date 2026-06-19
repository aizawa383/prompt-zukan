import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { incrementReuse, recordView } from '@/app/actions'
import StatusBadge from '@/components/StatusBadge'
import CategoryChip from '@/components/CategoryChip'
import DeleteButton from '@/components/DeleteButton'
import Link from 'next/link'
import Image from 'next/image'

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

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/home" className="text-sm text-[#6B7280] hover:text-[#2F2F2F] transition">← 一覧へ</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">

        {/* ヘッダーカード */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <h1 className="text-xl font-bold text-[#2F2F2F] mb-3 leading-snug">{log.title}</h1>
          <div className="flex flex-wrap gap-1.5 mb-5">
            <StatusBadge status={log.status} />
            {categories.map((c: any) => (
              <CategoryChip key={c.id} name={c.name} size="md" />
            ))}
            {tags.map((t: any) => (
              <span key={t.id} className="text-xs border border-[#E5E7EB] text-[#6B7280] px-2.5 py-0.5 rounded-full"># {t.name}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-4 border-t border-[#F3F4F6]">
            <form action={incrementReuse.bind(null, id)}>
              <button type="submit" className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-semibold px-4 py-2 rounded-full transition border border-amber-200">
                ♻ 再利用した（{log.reuse_count}回）
              </button>
            </form>
            <Link href={`/logs/${id}/edit`} className="bg-[#F8F7F4] hover:bg-[#F3F4F6] text-[#6B7280] text-sm font-semibold px-4 py-2 rounded-full transition border border-[#E5E7EB]">
              ✏ 編集
            </Link>
            <DeleteButton id={id} />
          </div>
        </div>

        {/* 画像 */}
        {log.image_url && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
            <Image src={log.image_url} alt={log.title} width={800} height={500} className="w-full object-contain max-h-[500px]" unoptimized />
          </div>
        )}

        {/* やりたかったこと */}
        {log.purpose && (
          <Section title="やりたかったこと">
            <p className="text-sm text-[#2F2F2F] leading-relaxed">{log.purpose}</p>
          </Section>
        )}

        {/* プロンプト */}
        {(log.prompt_body || log.result) && (
          <Section title="プロンプト">
            {log.prompt_body && (
              <div>
                <p className="text-xs font-semibold text-[#6B7280] mb-2">プロンプト本文</p>
                <pre className="text-xs text-[#2F2F2F] font-mono bg-[#F8F7F4] rounded-xl p-4 whitespace-pre-wrap leading-relaxed border border-[#E5E7EB]">{log.prompt_body}</pre>
              </div>
            )}
            {log.result && <Field label="実行結果" value={log.result} />}
          </Section>
        )}

        {/* 学習メモ */}
        {log.memo && (
          <Section title="学習メモ">
            <p className="text-sm text-[#2F2F2F] whitespace-pre-wrap leading-relaxed">{log.memo}</p>
          </Section>
        )}

        {/* 補足メモ */}
        {log.supplement && (
          <Section title="補足メモ">
            <p className="text-sm text-[#2F2F2F] whitespace-pre-wrap leading-relaxed">{log.supplement}</p>
          </Section>
        )}

        {/* 参考元・資料 */}
        {(log.source || urls.length > 0) && (
          <Section title="参考元・資料">
            {log.source && <Field label="出典" value={log.source} />}
            {urls.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#6B7280] mb-2">参考URL</p>
                <div className="space-y-1.5">
                  {urls.map((u: any) => (
                    <div key={u.id} className="text-sm flex items-center gap-2">
                      {u.label && <span className="text-xs text-[#9CA3AF]">{u.label}</span>}
                      <a href={u.url} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline break-all text-xs">{u.url}</a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* 記録 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <p className="text-xs font-bold text-[#9CA3AF] tracking-widest uppercase mb-3">記録</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#9CA3AF]">
            <span>作成：{formatDate(log.created_at)}</span>
            <span>更新：{formatDate(log.updated_at)}</span>
            <span>最終閲覧：{formatDate(log.last_viewed_at)}</span>
            <span>再利用：{log.reuse_count}回</span>
          </div>
        </div>

      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4 shadow-sm">
      <p className="text-xs font-bold text-[#6B7280] tracking-widest uppercase pb-3 border-b border-[#F3F4F6]">{title}</p>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#6B7280] mb-1">{label}</p>
      <p className="text-sm text-[#2F2F2F] whitespace-pre-wrap leading-relaxed">{value}</p>
    </div>
  )
}
