import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import LogForm from '@/components/LogForm'
import { updateLog } from '@/app/actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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
    image_url: log.image_url ?? '',
  }

  const action = updateLog.bind(null, id)

  return (
    <div className="min-h-screen bg-[#F5F2FB]">
      <nav className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-white/50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/logs/${id}`} className="flex items-center gap-1.5 text-[#6B50B8] text-sm font-medium hover:opacity-70 transition">
            <ArrowLeft size={16} />
            <span>Prompt Zukan</span>
          </Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-12">
        <h1 className="text-xl font-bold text-[#2D1F6E] mb-0.5">ログを編集</h1>
        <div className="flex items-center gap-1.5 text-[#C4B5FD] text-xs mb-6">
          <span>—</span><span>✦</span><span>—</span>
        </div>
        <LogForm
          action={action}
          allTags={tags ?? []}
          defaultValues={defaultValues}
        />
      </div>
    </div>
  )
}
