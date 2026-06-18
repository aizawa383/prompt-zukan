import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { incrementReuse, recordView } from '@/app/actions'
import StatusBadge from '@/components/StatusBadge'
import DeleteButton from '@/components/DeleteButton'
import Link from 'next/link'

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
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/home" className="text-sm text-gray-400 hover:text-purple-400 transition">← 一覧へ</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">

        {/* ヘッダーカード */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-gray-100 p-6">
          <h1 className="text-xl font-bold text-gray-700 mb-3 leading-snug">{log.title}</h1>
          <div className="flex flex-wrap gap-1.5 mb-4">
            <StatusBadge status={log.status} />
            {categories.map((c: any) => (
              <span key={c.id} className="text-xs bg-purple-100 text-purple-600 px-2.5 py-0.5 rounded-full font-medium">{c.name}</span>
            ))}
            {tags.map((t: any) => (
              <span key={t.id} className="text-xs border border-pink-200 text-pink-500 px-2.5 py-0.5 rounded-full"># {t.name}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <form action={incrementReuse.bind(null, id)}>
              <button type="submit" className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-semibold px-4 py-2 rounded-full transition">
                ♻ 再利用した（{log.reuse_count}回）
              </button>
            </form>
            <Link href={`/logs/${id}/edit`} className="bg-blue-50 hover:bg-blue-100 text-blue-500 text-sm font-semibold px-4 py-2 rounded-full transition">
              ✏ 編集
            </Link>
            <DeleteButton id={id} />
          </div>
        </div>

        {/* 基本情報 */}
        {log.purpose && (
          <Section title="やりたかったこと">
            <p className="text-sm text-gray-700 leading-relaxed">{log.purpose}</p>
          </Section>
        )}

        {/* プロンプト */}
        {(log.prompt_body || log.result) && (
          <Section title="プロンプト">
            {log.prompt_body && <Field label="プロンプト本文" value={log.prompt_body} mono />}
            {log.result && <Field label="実行結果" value={log.result} />}
          </Section>
        )}

        {/* 学習メモ */}
        {log.memo && (
          <Section title="学習メモ">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{log.memo}</p>
          </Section>
        )}

        {/* 補足メモ */}
        {log.supplement && (
          <Section title="補足メモ">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{log.supplement}</p>
          </Section>
        )}

        {/* 参考元・資料 */}
        {(log.source || urls.length > 0) && (
          <Section title="参考元・資料">
            {log.source && <Field label="出典" value={log.source} />}
            {urls.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2">参考URL</p>
                <div className="space-y-1">
                  {urls.map((u: any) => (
                    <div key={u.id} className="text-sm">
                      {u.label && <span className="text-xs text-gray-400 mr-2">{u.label}</span>}
                      <a href={u.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{u.url}</a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* 記録 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-bold text-purple-400 tracking-widest uppercase mb-3">記録</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
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
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <p className="text-xs font-bold text-purple-400 tracking-widest uppercase">{title}</p>
      {children}
    </div>
  )
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
      <p className={`text-sm text-gray-700 whitespace-pre-wrap leading-relaxed ${mono ? 'font-mono bg-purple-50 rounded-xl p-3 text-xs' : ''}`}>
        {value}
      </p>
    </div>
  )
}
