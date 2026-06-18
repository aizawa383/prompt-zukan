import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import LogForm from '@/components/LogForm'
import { updateLog } from '@/app/actions'
import Link from 'next/link'

export default async function EditLogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: log }, { data: tags }] = await Promise.all([
    supabase.from('logs').select(`
      *,
      log_categories(categories(id, name)),
      log_tags(tags(id, name)),
      reference_urls(*)
    `).eq('id', id).eq('user_id', user.id).single(),
    supabase.from('tags').select('*').order('name'),
  ])

  if (!log) notFound()

  const defaultValues = {
    title: log.title,
    purpose: log.purpose ?? '',
    prompt_body: log.prompt_body ?? '',
    result: log.result ?? '',
    memo: log.memo ?? '',
    supplement: log.supplement ?? '',
    source: log.source ?? '',
    status: log.status,
    categories: log.log_categories?.map((lc: any) => lc.categories?.name).filter(Boolean) ?? [],
    tags: log.log_tags?.map((lt: any) => lt.tags?.name).filter(Boolean) ?? [],
    reference_urls: log.reference_urls ?? [],
  }

  const action = updateLog.bind(null, id)

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/logs/${id}`} className="text-sm text-gray-400 hover:text-purple-400 transition">← 詳細へ戻る</Link>
          <span className="text-gray-200">|</span>
          <span className="text-sm font-semibold text-gray-600">ログを編集</span>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <LogForm
          action={action}
          allTags={tags ?? []}
          defaultValues={defaultValues}
        />
      </div>
    </div>
  )
}
