'use client'

import { useState } from 'react'
import { STATUS_LIST, CATEGORY_OPTIONS } from '@/lib/types'

type Props = {
  action: (formData: FormData) => Promise<void>
  allTags: { id: string; name: string }[]
  defaultValues?: {
    title?: string
    purpose?: string
    prompt_body?: string
    result?: string
    memo?: string
    supplement?: string
    source?: string
    status?: string
    categories?: string[]
    tags?: string[]
    reference_urls?: { url: string; label: string | null }[]
  }
}

export default function LogForm({ action, allTags, defaultValues = {} }: Props) {
  const [selectedCats, setSelectedCats] = useState<string[]>(defaultValues.categories ?? [])
  const [selectedTags, setSelectedTags] = useState<string[]>(defaultValues.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [urls, setUrls] = useState<{ url: string; label: string }[]>(
    defaultValues.reference_urls?.map(u => ({ url: u.url, label: u.label ?? '' })) ?? []
  )
  const [pending, setPending] = useState(false)

  const unselectedTags = allTags.filter(t => !selectedTags.includes(t.name))
  const filteredSuggestions = tagInput
    ? unselectedTags.filter(t => t.name.includes(tagInput))
    : []

  function toggleCat(name: string) {
    setSelectedCats(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name])
  }

  function toggleTag(name: string) {
    setSelectedTags(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name])
  }

  function addTagFromInput() {
    const t = tagInput.trim()
    if (t && !selectedTags.includes(t)) setSelectedTags(prev => [...prev, t])
    setTagInput('')
    setShowSuggestions(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)
    selectedCats.forEach(c => fd.append('categories', c))
    selectedTags.forEach(t => fd.append('tags', t))
    urls.forEach(u => { fd.append('url_value', u.url); fd.append('url_label', u.label) })
    await action(fd)
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* 基本情報 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xs font-bold text-purple-400 tracking-widest uppercase">基本情報</h2>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">タイトル<span className="text-pink-400 ml-0.5">*</span></label>
          <input type="text" name="title" defaultValue={defaultValues.title ?? ''} required
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">やりたかったこと</label>
          <input type="text" name="purpose" defaultValue={defaultValues.purpose ?? ''}
            placeholder="このプロンプトで何を作りたかったか、何を試したかったかを書く"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">状態</label>
          <select name="status" defaultValue={defaultValues.status ?? '未使用'}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-300 text-gray-700">
            {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </section>

      {/* プロンプト */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xs font-bold text-purple-400 tracking-widest uppercase">プロンプト</h2>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">プロンプト本文</label>
          <textarea name="prompt_body" rows={6} defaultValue={defaultValues.prompt_body ?? ''}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition resize-y font-mono" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">実行結果</label>
          <textarea name="result" rows={5} defaultValue={defaultValues.result ?? ''}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition resize-y" />
        </div>
      </section>

      {/* 学習メモ */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-xs font-bold text-purple-400 tracking-widest uppercase mb-4">学習メモ</h2>
        <textarea name="memo" rows={6} defaultValue={defaultValues.memo ?? ''}
          placeholder={'・うまくいった点\n・微妙だった点\n・次に試したいこと\n・再利用したい言葉や構文'}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition resize-y" />
      </section>

      {/* 補足メモ */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-xs font-bold text-purple-400 tracking-widest uppercase mb-4">補足メモ</h2>
        <textarea name="supplement" rows={4} defaultValue={defaultValues.supplement ?? ''}
          placeholder="単語の意味・作者の説明・参考記事の要点・プロンプトの構造説明など"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition resize-y" />
      </section>

      {/* 分類 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <h2 className="text-xs font-bold text-purple-400 tracking-widest uppercase">分類</h2>

        {/* 用途 */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">用途 <span className="text-gray-300 font-normal">（複数選択可）</span></label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map(name => (
              <button type="button" key={name} onClick={() => toggleCat(name)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                  selectedCats.includes(name)
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-purple-100 hover:text-purple-600'
                }`}>
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* タグ */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">タグ <span className="text-gray-300 font-normal">（選択または入力）</span></label>

          {unselectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {unselectedTags.map(t => (
                <button type="button" key={t.id} onClick={() => toggleTag(t.name)}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-400 hover:border-pink-200 hover:text-pink-400 transition">
                  # {t.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200 rounded-xl min-h-[44px] focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-50 transition">
            {selectedTags.map(t => (
              <span key={t} className="inline-flex items-center gap-1 bg-pink-50 border border-pink-200 text-pink-500 text-xs px-2.5 py-0.5 rounded-full">
                # {t}
                <button type="button" onClick={() => setSelectedTags(prev => prev.filter(x => x !== t))} className="opacity-50 hover:opacity-100 leading-none">×</button>
              </span>
            ))}
            <div className="relative flex-1 min-w-[120px]">
              <input type="text" value={tagInput}
                onChange={e => { setTagInput(e.target.value); setShowSuggestions(true) }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (tagInput.trim()) addTagFromInput() } }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder={selectedTags.length === 0 ? '新しいタグを入力して Enter…' : ''}
                className="w-full text-xs outline-none bg-transparent text-gray-700 placeholder-gray-300 py-0.5" />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 top-full mt-1 z-10 border border-gray-100 rounded-xl shadow-sm bg-white overflow-hidden min-w-[140px]">
                  {filteredSuggestions.slice(0, 6).map(t => (
                    <button type="button" key={t.id} onMouseDown={() => { toggleTag(t.name); setTagInput('') }}
                      className="block w-full text-left text-xs px-3 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-500">
                      # {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 参考元・資料 */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xs font-bold text-purple-400 tracking-widest uppercase">参考元・資料</h2>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">出典</label>
          <input type="text" name="source" defaultValue={defaultValues.source ?? ''}
            placeholder="書籍名・サイト名・発信者名など"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">参考URL</label>
          <div className="space-y-2 mb-2">
            {urls.map((u, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" value={u.label} onChange={e => setUrls(prev => prev.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                  placeholder="ラベル（任意）" className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-purple-300" />
                <input type="text" value={u.url} onChange={e => setUrls(prev => prev.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                  placeholder="https://..." className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-purple-300" />
                <button type="button" onClick={() => setUrls(prev => prev.filter((_, j) => j !== i))} className="text-gray-300 hover:text-pink-400 text-lg leading-none">×</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setUrls(prev => [...prev, { url: '', label: '' }])}
            className="text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl px-3 py-1.5 hover:border-purple-300 hover:text-purple-400 transition">
            ＋ URLを追加
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
