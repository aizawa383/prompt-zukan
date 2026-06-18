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
    insights: formData.get('insights') as string || null,
    reuse_points: formData.get('reuse_points') as string || null,
    ideas: formData.get('ideas') as string || null,
    source: formData.get('source') as string || null,
    status: formData.get('status') as string || '未検証',
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
    insights: formData.get('insights') as string || null,
    reuse_points: formData.get('reuse_points') as string || null,
    ideas: formData.get('ideas') as string || null,
    source: formData.get('source') as string || null,
    status: formData.get('status') as string || '未検証',
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id)

  // 関連データ削除して再登録
  await supabase.from('log_categories').delete().eq('log_id', id)
  await supabase.from('log_tags').delete().eq('log_id', id)
  await supabase.from('reference_urls').delete().eq('log_id', id)
  await supabase.from('reference_images').delete().eq('log_id', id)
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

  await supabase.from('view_history').insert({ user_id: user.id, log_id: logId })
  await supabase.from('logs').update({ last_viewed_at: new Date().toISOString() })
    .eq('id', logId).eq('user_id', user.id)
}

// ─── カテゴリ追加 ─────────────────────────────────────────────────────
export async function createCategory(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from('categories')
    .upsert({ user_id: user.id, name }, { onConflict: 'user_id,name' })
    .select().single()
  return data
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

  const defaults = ['画像生成', 'デザイン', 'Web制作', 'AI活用', '仕事術', '案件獲得', 'ブランディング', '文章作成', 'その他']
  for (const name of defaults) {
    await supabase.from('categories').upsert({ user_id: user.id, name }, { onConflict: 'user_id,name' })
  }
}

// ─── ヘルパー ──────────────────────────────────────────────────────────
async function saveRelations(supabase: any, logId: string, userId: string, formData: FormData) {
  const categoryNames = formData.getAll('categories') as string[]
  for (const name of categoryNames) {
    const { data: cat } = await supabase.from('categories')
      .upsert({ user_id: userId, name }, { onConflict: 'user_id,name' })
      .select().single()
    if (cat) await supabase.from('log_categories').upsert({ log_id: logId, category_id: cat.id })
  }

  const tagNames = formData.getAll('tags') as string[]
  for (const name of tagNames) {
    if (!name.trim()) continue
    const { data: tag } = await supabase.from('tags')
      .upsert({ user_id: userId, name: name.trim() }, { onConflict: 'user_id,name' })
      .select().single()
    if (tag) await supabase.from('log_tags').upsert({ log_id: logId, tag_id: tag.id })
  }

  const urlValues = formData.getAll('url_value') as string[]
  const urlLabels = formData.getAll('url_label') as string[]
  const urlRows = urlValues.map((url, i) => ({ log_id: logId, url, label: urlLabels[i] || null, sort_order: i })).filter(r => r.url)
  if (urlRows.length) await supabase.from('reference_urls').insert(urlRows)

  const imgPaths = formData.getAll('img_path') as string[]
  const imgLabels = formData.getAll('img_label') as string[]
  const imgRows = imgPaths.map((path, i) => ({ log_id: logId, path, label: imgLabels[i] || null, sort_order: i })).filter(r => r.path)
  if (imgRows.length) await supabase.from('reference_images').insert(imgRows)
}
