'use client'

import { useState } from 'react'
import { STATUS_LIST } from '@/lib/types'

type Props = {
  action: (formData: FormData) => Promise<void>
  categories: { id: string; name: string }[]
  allTags: { id: string; name: string }[]
  defaultValues?: {
    title?: string
    purpose?: string
    prompt_body?: string
    result?: string
    insights?: string
    reuse_points?: string
    ideas?: string
    source?: string
    status?: string
    categories?: string[]
    tags?: string[]
    reference_urls?: { url: string; label: string | null }[]
    reference_images?: { path: string; label: string | null }[]
  }
  onAddCategory?: (name: string) => Promise<{ id: string; name: string } | null>
}

export default function LogForm({ action, categories, allTags, defaultValues = {}, onAddCategory }: Props) {
  const [selectedCats, setSelectedCats] = useState<string[]>(defaultValues.categories ?? [])
  const [tags, setTags] = useState<string[]>(defaultValues.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [urls, setUrls] = useState<{ url: string; label: string }[]>(
    defaultValues.reference_urls?.map(u => ({ url: u.url, label: u.label ?? '' })) ?? []
  )
  const [imgs, setImgs] = useState<{ path: string; label: string }[]>(
    defaultValues.reference_images?.map(i => ({ path: i.path, label: i.label ?? '' })) ?? []
  )
  const [newCatInput, setNewCatInput] = useState('')
  const [catList, setCatList] = useState(categories)
  const [pending, setPending] = useState(false)

  const tagSuggestions = allTags.filter(t => t.name.includes(tagInput) && !tags.includes(t.name))

  function toggleCat(name: string) {
    setSelectedCats(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name])
  }

  function addTag(name: string) {
    const t = name.trim()
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    setTagInput('')
    setShowTagSuggestions(false)
  }

  async function handleAddCategory() {
    const name = newCatInput.trim()
    if (!name || catList.some(c => c.name === name)) return
    const result = onAddCategory ? await onAddCategory(name) : null
    if (result) {
      setCatList(prev => [...prev, result])
      setSelectedCats(prev => [...prev, name])
      setNewCatInput('')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)
    selectedCats.forEach(c => fd.append('categories', c))
    tags.forEach(t => fd.append('tags', t))
    urls.forEach(u => { fd.append('url_value', u.url); fd.append('url_label', u.label) })
    imgs.forEach(i => { fd.append('img_path', i.path); fd.append('img_label', i.label) })
    await action(fd)
    setPending(false)
  }

  const field = (label: string, name: string, required = false) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}{required && <span className="text-pink-400 ml-0.5">*</span>}</label>
      <input type="text" name={name} defaultValue={(defaultValues as any)[name] ?? ''} required={required}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition" />
    </div>
  )

  const textarea = (label: string, name: string, rows = 4, mono = false) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <textarea name={name} rows={rows} defaultValue={(defaultValues as any)[name] ?? ''}
        className={`w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition resize-y ${mono ? 'font-mono' : ''}`} />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* 基本情報 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xs font-bold text-purple-400 tracking-widest uppercase">基本情報</h2>
        {field('タイトル', 'title', true)}
        {field('目的', 'purpose')}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">状態</label>
          <select name="status" defaultValue={defaultValues.status ?? '未検証'}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-300 text-gray-700">
            {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {field('出典', 'source')}
      </section>

      {/* プロンプト */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xs font-bold text-purple-400 tracking-widest uppercase">プロンプト</h2>
        {textarea('プロンプト本文', 'prompt_body', 6, true)}
        {textarea('実行結果', 'result', 5)}
      </section>

      {/* 学習メモ */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xs font-bold text-purple-400 tracking-widest uppercase">学習メモ</h2>
        {textarea('気づき', 'insights')}
        {textarea('再利用ポイント', 'reuse_points')}
        {textarea('思いついたアイデア', 'ideas')}
      </section>

      {/* カテゴリ・タグ */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-xs font-bold text-purple-400 tracking-widest uppercase">分類</h2>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">カテゴリ <span className="text-gray-300 font-normal">（複数選択可）</span></label>
          <div className="flex flex-wrap gap-2 mb-3">
            {catList.map(c => (
              <button type="button" key={c.id} onClick={() => toggleCat(c.name)}
                className={`text-xs px-3 py-1 rounded-full border transition ${selectedCats.includes(c.name) ? 'bg-purple-100 border-purple-300 text-purple-600 font-semibold' : 'border-gray-200 text-gray-500 hover:border-purple-200'}`}>
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newCatInput} onChange={e => setNewCatInput(e.target.value)}
              placeholder="新しいカテゴリを追加"
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-purple-300" />
            <button type="button" onClick={handleAddCategory}
              className="text-xs px-3 py-1.5 border border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-purple-300 hover:text-purple-400 transition">
              追加
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">タグ <span className="text-gray-300 font-normal">（Enterで追加）</span></label>
          <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200 rounded-xl min-h-[44px] focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-50 transition">
            {tags.map(t => (
              <span key={t} className="inline-flex items-center gap-1 bg-pink-50 text-pink-400 text-xs px-2 py-0.5 rounded-full">
                # {t}
                <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))} className="opacity-60 hover:opacity-100">×</button>
              </span>
            ))}
            <input type="text" value={tagInput}
              onChange={e => { setTagInput(e.target.value); setShowTagSuggestions(true) }}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (tagInput.trim()) addTag(tagInput) } }}
              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
              placeholder={tags.length === 0 ? 'タグを入力…' : ''}
              className="flex-1 min-w-[100px] text-xs outline-none bg-transparent" />
          </div>
          {showTagSuggestions && tagInput && tagSuggestions.length > 0 && (
            <div className="border border-gray-100 rounded-xl mt-1 shadow-sm bg-white overflow-hidden">
              {tagSuggestions.slice(0, 6).map(t => (
                <button type="button" key={t.id} onMouseDown={() => addTag(t.name)}
                  className="block w-full text-left text-xs px-3 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-500">
                  # {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 参考資料 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-xs font-bold text-purple-400 tracking-widest uppercase">参考資料</h2>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">参考URL</label>
          <div className="space-y-2 mb-2">
            {urls.map((u, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" value={u.label} onChange={e => setUrls(prev => prev.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                  placeholder="ラベル（任意）" className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-purple-300" />
                <input type="text" value={u.url} onChange={e => setUrls(prev => prev.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                  placeholder="https://..." className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-purple-300" />
                <button type="button" onClick={() => setUrls(prev => prev.filter((_, j) => j !== i))} className="text-gray-300 hover:text-pink-400 text-lg">×</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setUrls(prev => [...prev, { url: '', label: '' }])}
            className="text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl px-3 py-1.5 hover:border-purple-300 hover:text-purple-400 transition">
            ＋ URLを追加
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">参考画像 <span className="text-gray-300 font-normal">（URLまたはパス）</span></label>
          <div className="space-y-2 mb-2">
            {imgs.map((img, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" value={img.label} onChange={e => setImgs(prev => prev.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                  placeholder="説明（任意）" className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-purple-300" />
                <input type="text" value={img.path} onChange={e => setImgs(prev => prev.map((x, j) => j === i ? { ...x, path: e.target.value } : x))}
                  placeholder="URL または ファイルパス" className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-purple-300" />
                <button type="button" onClick={() => setImgs(prev => prev.filter((_, j) => j !== i))} className="text-gray-300 hover:text-pink-400 text-lg">×</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setImgs(prev => [...prev, { path: '', label: '' }])}
            className="text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl px-3 py-1.5 hover:border-purple-300 hover:text-purple-400 transition">
            ＋ 画像を追加
          </button>
        </div>
      </section>

      {/* 送信 */}
      <div className="flex justify-end gap-3">
        <a href="/home" className="px-5 py-2.5 text-sm text-gray-400 border border-gray-200 rounded-full hover:border-gray-300 transition">キャンセル</a>
        <button type="submit" disabled={pending}
          className="px-6 py-2.5 bg-purple-300 hover:bg-purple-400 text-white text-sm font-semibold rounded-full transition disabled:opacity-50">
          {pending ? '保存中…' : '保存する'}
        </button>
      </div>
    </form>
  )
}
