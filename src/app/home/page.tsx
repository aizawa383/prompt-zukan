import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: logs }, { data: categories }, { data: tags }] = await Promise.all([
    supabase.from('logs').select(`
      *,
      log_categories(categories(id, name)),
      log_tags(tags(id, name))
    `).order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
    supabase.from('tags').select('*').order('name'),
  ])

  return (
    <HomeClient
      initialLogs={logs ?? []}
      categories={categories ?? []}
      tags={tags ?? []}
    />
  )
}
