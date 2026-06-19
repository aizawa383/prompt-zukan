import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogForm from '@/components/LogForm'
import { createLog, ensureDefaultCategories } from '@/app/actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewLogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await ensureDefaultCategories()

  const { data: tags } = await supabase.from('tags').select('*').order('name')

  return (
    <div className="min-h-screen bg-[#F5F2FB]">
      <nav className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-white/50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-1.5 text-[#6B50B8] text-sm font-medium hover:opacity-70 transition">
            <ArrowLeft size={16} />
            <span>Prompt Zukan</span>
          </Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-12">
        <h1 className="text-xl font-bold text-[#2D1F6E] mb-0.5">新規ログ作成</h1>
        <div className="flex items-center gap-1.5 text-[#C4B5FD] text-xs mb-6">
          <span>—</span><span>✦</span><span>—</span>
        </div>
        <LogForm
          action={createLog}
          allTags={tags ?? []}
        />
      </div>
    </div>
  )
}
