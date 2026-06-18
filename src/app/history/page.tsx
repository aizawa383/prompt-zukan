import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: history } = await supabase
    .from('view_history')
    .select('viewed_at, log_id, logs(id, title, status, log_categories(categories(name)))')
    .eq('user_id', user.id)
    .order('viewed_at', { ascending: false })
    .limit(100)

  function formatDatetime(str: string) {
    return new Date(str).toLocaleString('ja-JP', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/home" className="text-sm text-gray-400 hover:text-purple-400 transition">← 一覧へ</Link>
          <span className="text-gray-200">|</span>
          <span className="text-sm font-semibold text-gray-600">閲覧履歴</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {!history || history.length === 0 ? (
          <div className="text-center py-20 text-gray-300">
            <div className="text-5xl mb-4">🕐</div>
            <p className="text-sm">まだ閲覧履歴がありません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((h: any, i) => {
              const log = h.logs
              if (!log) return null
              const cats = log.log_categories?.map((lc: any) => lc.categories?.name).filter(Boolean) ?? []
              return (
                <Link key={i} href={`/logs/${log.id}`}>
                  <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:shadow-sm hover:border-purple-100 transition">
                    <span className="text-xs text-gray-300 whitespace-nowrap min-w-[120px]">{formatDatetime(h.viewed_at)}</span>
                    <span className="text-sm font-semibold text-gray-700 flex-1 truncate">{log.title}</span>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <StatusBadge status={log.status} />
                      {cats.slice(0, 2).map((c: string, j: number) => (
                        <span key={j} className="text-xs bg-purple-50 text-purple-400 px-2 py-0.5 rounded-full hidden sm:inline">{c}</span>
                      ))}
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
