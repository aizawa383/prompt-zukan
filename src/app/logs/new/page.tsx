import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogForm from '@/components/LogForm'
import { createLog, createCategory, ensureDefaultCategories } from '@/app/actions'
import Link from 'next/link'

export default async function NewLogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await ensureDefaultCategories()

  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('tags').select('*').order('name'),
  ])

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/home" className="text-sm text-gray-400 hover:text-purple-400 transition">← 一覧へ</Link>
          <span className="text-gray-200">|</span>
          <span className="text-sm font-semibold text-gray-600">新しいログ</span>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <LogForm
          action={createLog}
          categories={categories ?? []}
          allTags={tags ?? []}
          onAddCategory={createCategory}
        />
      </div>
    </div>
  )
}
