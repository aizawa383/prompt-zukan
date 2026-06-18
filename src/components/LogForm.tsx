'use client'

import { useState } from 'react'
import { STATUS_LIST, CATEGORY_OPTIONS, CATEGORY_STYLE, CategoryOption } from '@/lib/types'

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

const inputCls = 'w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-sm text-[#2F2F2F] placeholder-[#9CA3AF] outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition bg-white'
const textareaCls = 'w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-sm text-[#2F2F2F] placeholder-[#9CA3AF] outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition resize-y bg-white'
const labelCls = 'block text-xs font-semibold text-[#6B7280] mb-1'
const sectionHeadingCls = 'text-xs font-bold text-[#6B7280] tracking-widest uppercase pb-3 mb-4 border-b border-[#E5E7EB]'

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
  const filteredSuggestions = tagInput ? unselectedTags.filter(t => t.name.includes(tagInput)) : []

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
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 基本情報 */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
        <h2 className={sectionHeadingCls}>基本情報</h2>

        <div>
          <label className={labelCls}>タイトル<span className="text-pink-500 ml-0.5">*</span></label>
          <input type="text" name="title" defaultValue={defaultValues.title ?? ''} required className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>やりたかったこと</label>
          <input type="text" name="purpose" defaultValue={defaultValues.purpose ?? ''}
            placeholder="このプロンプトで何を作りたかったか、何を試したかったかを書く"
            className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>状態</label>
          <select name="status" defaultValue={defaultValues.status ?? '未使用'}
            className="border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#2F2F2F] outline-none focus:border-purple-300 bg-white">
            {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </section>

      {/* プロンプト */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
        <h2 className={sectionHeadingCls}>プロンプト</h2>
        <div>
          <label className={labelCls}>プロンプト本文</label>
          <textarea name="prompt_body" rows={6} defaultValue={defaultValues.prompt_body ?? ''}
            className={`${textareaCls} font-mono text-xs`} />
        </div>
        <div>
          <label className={labelCls}>実行結果</label>
          <textarea name="result" rows={5} defaultValue={defaultValues.result ?? ''} className={textareaCls} />
        </div>
      </section>

      {/* 学習メモ */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <h2 className={sectionHeadingCls}>学習メモ</h2>
        <textarea name="memo" rows={6} defaultValue={defaultValues.memo ?? ''}
          placeholder={'・うまくいった点\n・微妙だった点\n・次に試したいこと\n・再利用したい言葉や構文'}
          className={textareaCls} />
      </section>

      {/* 補足メモ */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <h2 className={sectionHeadingCls}>補足メモ</h2>
        <textarea name="supplement" rows={4} defaultValue={defaultValues.supplement ?? ''}
          placeholder="単語の意味・作者の説明・参考記事の要点・プロンプトの構造説明など"
          className={textareaCls} />
      </section>

      {/* 分類 */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-6">
        <h2 className={sectionHeadingCls}>分類</h2>

        {/* 用途 */}
        <div>
          <label className={labelCls}>用途 <span className="text-[#9CA3AF] font-normal">（複数選択可）</span></label>
          <div className="flex flex-wrap gap-2 mt-2">
            {CATEGORY_OPTIONS.map(name => {
              const style = CATEGORY_STYLE[name as CategoryOption]
              const selected = selectedCats.includes(name)
              return (
                <button type="button" key={name} onClick={() => toggleCat(name)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition border-2 ${
                    selected
                      ? `${style.bg} ${style.text} border-transparent shadow-sm`
                      : 'bg-white text-[#9CA3AF] border-[#E5E7EB] hover:border-[#D1D5DB]'
                  }`}>
                  {name}
                </button>
              )
            })}
          </div>
        </div>

        {/* タグ */}
        <div>
          <label className={labelCls}>タグ <span className="text-[#9CA3AF] font-normal">（選択または入力）</span></label>

          {unselectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
              {unselectedTags.map(t => (
                <button type="button" key={t.id} onClick={() => toggleTag(t.name)}
                  className="text-xs px-2.5 py-0.5 rounded-full border border-[#E5E7EB] text-[#9CA3AF] hover:border-[#D1D5DB] hover:text-[#6B7280] transition">
                  # {t.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 p-2 border border-[#E5E7EB] rounded-xl min-h-[44px] bg-white focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-50 transition">
            {selectedTags.map(t => (
              <span key={t} className="inline-flex items-center gap-1 border border-[#D1D5DB] text-[#6B7280] text-xs px-2.5 py-0.5 rounded-full bg-[#F9FAFB]">
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
                className="w-full text-xs outline-none bg-transparent text-[#2F2F2F] placeholder-[#9CA3AF] py-0.5" />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 top-full mt-1 z-10 border border-[#E5E7EB] rounded-xl shadow-sm bg-white overflow-hidden min-w-[140px]">
                  {filteredSuggestions.slice(0, 6).map(t => (
                    <button type="button" key={t.id} onMouseDown={() => { toggleTag(t.name); setTagInput('') }}
                      className="block w-full text-left text-xs px-3 py-2 text-[#2F2F2F] hover:bg-[#F8F7F4]">
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
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
        <h2 className={sectionHeadingCls}>参考元・資料</h2>

        <div>
          <label className={labelCls}>出典</label>
          <input type="text" name="source" defaultValue={defaultValues.source ?? ''}
            placeholder="書籍名・サイト名・発信者名など" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>参考URL</label>
          <div className="space-y-2 mb-2">
            {urls.map((u, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" value={u.label}
                  onChange={e => setUrls(prev => prev.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                  placeholder="ラベル（任意）"
                  className="w-28 px-2 py-1.5 border border-[#E5E7EB] rounded-lg text-xs text-[#2F2F2F] outline-none focus:border-purple-300 bg-white" />
                <input type="text" value={u.url}
                  onChange={e => setUrls(prev => prev.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                  placeholder="https://..."
                  className="flex-1 px-2 py-1.5 border border-[#E5E7EB] rounded-lg text-xs text-[#2F2F2F] outline-none focus:border-purple-300 bg-white" />
                <button type="button" onClick={() => setUrls(prev => prev.filter((_, j) => j !== i))}
                  className="text-[#D1D5DB] hover:text-red-400 text-lg leading-none transition">×</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setUrls(prev => [...prev, { url: '', label: '' }])}
            className="text-xs text-[#9CA3AF] border border-dashed border-[#E5E7EB] rounded-xl px-3 py-1.5 hover:border-[#D1D5DB] hover:text-[#6B7280] transition">
            ＋ URLを追加
          </button>
        </div>
      </section>

      {/* 送信 */}
      <div className="flex justify-end gap-3 pb-4">
        <a href="/home" className="px-5 py-2.5 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-full hover:border-[#D1D5DB] transition">キャンセル</a>
        <button type="submit" disabled={pending}
          className="px-6 py-2.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold rounded-full transition disabled:opacity-50 shadow-sm">
          {pending ? '保存中…' : '保存する'}
        </button>
      </div>
    </form>
  )
}
