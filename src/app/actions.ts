'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── ログ作成 ──────────────────────────────────────────────────────────
export async function createLog(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: log, error } = await supabase.from('logs').insert({
    user_id: user.id,
    title: formData.get('title') as string,
    purpose: formData.get('purpose') as string || null,
    prompt_body: formData.get('prompt_body') as string || null,
    result: formData.get('result') as string || null,
    memo: formData.get('memo') as string || null,
    supplement: formData.get('supplement') as string || null,
    source: formData.get('source') as string || null,
    status: formData.get('status') as string || '未使用',
  }).select().single()

  if (error || !log) throw new Error('ログの作成に失敗しました')

  await saveRelations(supabase, log.id, user.id, formData)
  revalidatePath('/home')
  redirect(`/logs/${log.id}`)
}

// ─── ログ更新 ──────────────────────────────────────────────────────────
export async function updateLog(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('logs').update({
    title: formData.get('title') as string,
    purpose: formData.get('purpose') as string || null,
    prompt_body: formData.get('prompt_body') as string || null,
    result: formData.get('result') as string || null,
    memo: formData.get('memo') as string || null,
    supplement: formData.get('supplement') as string || null,
    source: formData.get('source') as string || null,
    status: formData.get('status') as string || '未使用',
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id)

  await Promise.all([
    supabase.from('log_categories').delete().eq('log_id', id),
    supabase.from('log_tags').delete().eq('log_id', id),
    supabase.from('reference_urls').delete().eq('log_id', id),
  ])
  await saveRelations(supabase, id, user.id, formData)

  revalidatePath(`/logs/${id}`)
  revalidatePath('/home')
  redirect(`/logs/${id}`)
}

// ─── ログ削除 ──────────────────────────────────────────────────────────
export async function deleteLog(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('logs').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/home')
  redirect('/home')
}

// ─── 再利用カウント ────────────────────────────────────────────────────
export async function incrementReuse(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: log } = await supabase.from('logs').select('reuse_count').eq('id', id).single()
  if (!log) return

  await supabase.from('logs').update({
    reuse_count: (log.reuse_count ?? 0) + 1,
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id)

  revalidatePath(`/logs/${id}`)
}

// ─── 閲覧履歴追加 ─────────────────────────────────────────────────────
export async function recordView(logId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await Promise.all([
    supabase.from('view_history').insert({ user_id: user.id, log_id: logId }),
    supabase.from('logs').update({ last_viewed_at: new Date().toISOString() }).eq('id', logId).eq('user_id', user.id),
  ])
}

// ─── ログアウト ────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ─── 初期カテゴリ作成 ─────────────────────────────────────────────────
export async function ensureDefaultCategories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  if (count && count > 0) return

  const defaults = ['画像生成', 'Web制作', 'デザイン', '文章作成', 'AI活用', '案件獲得', 'ブランディング', '仕事術', 'その他']
  await supabase.from('categories').insert(defaults.map(name => ({ user_id: user.id, name })))
}

// ─── ヘルパー ──────────────────────────────────────────────────────────
async function saveRelations(supabase: any, logId: string, userId: string, formData: FormData) {
  const categoryNames = formData.getAll('categories') as string[]
  const tagNames = (formData.getAll('tags') as string[]).filter(n => n.trim())
  const urlValues = formData.getAll('url_value') as string[]
  const urlLabels = formData.getAll('url_label') as string[]

  await Promise.all([
    ...categoryNames.map(async name => {
      const { data: cat } = await supabase.from('categories')
        .upsert({ user_id: userId, name }, { onConflict: 'user_id,name' })
        .select().single()
      if (cat) await supabase.from('log_categories').upsert({ log_id: logId, category_id: cat.id })
    }),
    ...tagNames.map(async name => {
      const { data: tag } = await supabase.from('tags')
        .upsert({ user_id: userId, name: name.trim() }, { onConflict: 'user_id,name' })
        .select().single()
      if (tag) await supabase.from('log_tags').upsert({ log_id: logId, tag_id: tag.id })
    }),
    (async () => {
      const urlRows = urlValues.map((url, i) => ({ log_id: logId, url, label: urlLabels[i] || null, sort_order: i })).filter(r => r.url)
      if (urlRows.length) await supabase.from('reference_urls').insert(urlRows)
    })(),
  ])
}
