'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { ImageIcon, Link2, Plus, X } from 'lucide-react'
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
    image_url?: string
  }
}

const inputCls = 'w-full px-3 py-2.5 border border-[#EDE8F7] rounded-xl text-sm text-[#2F2F2F] placeholder-[#C4B5FD] outline-none focus:border-[#9B8DC4] focus:ring-2 focus:ring-[#F0ECFB] transition bg-white'
const textareaCls = 'w-full px-3 py-2.5 border border-[#EDE8F7] rounded-xl text-sm text-[#2F2F2F] placeholder-[#C4B5FD] outline-none focus:border-[#9B8DC4] focus:ring-2 focus:ring-[#F0ECFB] transition resize-y bg-white'
const labelCls = 'block text-[10px] font-bold text-[#B0A0D8] tracking-widest uppercase mb-1.5'
const cardCls = 'bg-white rounded-2xl p-5 shadow-sm'

export default function LogForm({ action, allTags, defaultValues = {} }: Props) {
  const [selectedCats, setSelectedCats] = useState<string[]>(defaultValues.categories ?? [])
  const [selectedTags, setSelectedTags] = useState<string[]>(defaultValues.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [urls, setUrls] = useState<{ url: string; label: string }[]>(
    defaultValues.reference_urls?.map(u => ({ url: u.url, label: u.label ?? '' })) ?? []
  )
  const [status, setStatus] = useState(defaultValues.status ?? '未使用')
  const [pending, setPending] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(defaultValues.image_url ?? null)
  const [imageError, setImageError] = useState('')

  const filteredSuggestions = tagInput ? allTags.filter(t => t.name.includes(tagInput) && !selectedTags.includes(t.name)) : []

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

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setImageError('5MB以下の画像を選択してください')
      e.target.value = ''
      return
    }
    setImageError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)
    fd.set('status', status)
    selectedCats.forEach(c => fd.append('categories', c))
    const tagsToSave = [...selectedTags]
    const pendingTag = tagInput.trim()
    if (pendingTag && !tagsToSave.includes(pendingTag)) tagsToSave.push(pendingTag)
    tagsToSave.forEach(t => fd.append('tags', t))
    urls.forEach(u => { fd.append('url_value', u.url); fd.append('url_label', u.label) })

    if (imageFile) {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const ext = imageFile.name.split('.').pop()
      const path = `${user!.id}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('log-images').upload(path, imageFile)
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('log-images').getPublicUrl(path)
        fd.set('image_url', publicUrl)
      }
    } else if (defaultValues.image_url) {
      fd.set('image_url', defaultValues.image_url)
    }

    await action(fd)
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col lg:flex-row gap-4">

        {/* ── 左カラム ── */}
        <div className="flex-1 space-y-4">

          {/* タイトル・目的 */}
          <div className={cardCls}>
            <div className="mb-4">
              <label className={labelCls}>Title</label>
              <input type="text" name="title" defaultValue={defaultValues.title ?? ''}
                required placeholder="ログのタイトルを入力…" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Goal / Intent</label>
              <textarea name="purpose" rows={3} defaultValue={defaultValues.purpose ?? ''}
                placeholder="このプロンプトで達成したい目的は何ですか？" className={textareaCls} />
            </div>
          </div>

          {/* プロンプト本文 */}
          <div className={cardCls}>
            <label className={labelCls}>Prompt Body</label>
            <textarea name="prompt_body" rows={8} defaultValue={defaultValues.prompt_body ?? ''}
              placeholder="プロンプトの全文をここに入力…"
              className={`${textareaCls} font-mono text-xs`} />
          </div>

          {/* 実行結果 */}
          <div className={cardCls}>
            <label className={labelCls}>Execution Result</label>
            <textarea name="result" rows={4} defaultValue={defaultValues.result ?? ''}
              placeholder="実行結果やAIからの回答、改善点などをメモ…" className={textareaCls} />
          </div>

          {/* 学習メモ */}
          <div className={cardCls}>
            <label className={labelCls}>学習メモ</label>
            <textarea name="memo" rows={5} defaultValue={defaultValues.memo ?? ''}
              placeholder={'・うまくいった点\n・微妙だった点\n・次に試したいこと'}
              className={textareaCls} />
          </div>

          {/* 補足メモ */}
          <div className={cardCls}>
            <label className={labelCls}>補足メモ</label>
            <textarea name="supplement" rows={3} defaultValue={defaultValues.supplement ?? ''}
              placeholder="単語の意味・構造説明・参考記事の要点など"
              className={textareaCls} />
          </div>

        </div>

        {/* ── 右サイドバー ── */}
        <div className="lg:w-72 space-y-4">

          {/* ステータス */}
          <div className={cardCls}>
            <label className={labelCls}>Status</label>
            <div className="flex gap-1.5">
              {STATUS_LIST.map(s => (
                <button type="button" key={s} onClick={() => setStatus(s)}
                  className={`flex-1 text-xs py-2 rounded-xl font-semibold transition ${
                    status === s
                      ? 'bg-[#6B50B8] text-white shadow-sm'
                      : 'bg-[#F5F2FB] text-[#9B8DC4] hover:bg-[#EDE8F7]'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 画像アップロード */}
          <div className={cardCls}>
            <label className={labelCls}>Image Upload</label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-[#EDE8F7]">
                <Image src={imagePreview} alt="preview" width={300} height={200} className="w-full object-contain max-h-48" unoptimized />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null) }}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm border border-[#EDE8F7] transition">
                  <X size={12} className="text-[#9B8DC4]" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-[#DDD6FE] rounded-xl p-6 flex flex-col items-center gap-2 hover:border-[#C4B5FD] hover:bg-[#FAFAFE] transition">
                  <ImageIcon size={28} className="text-[#C4B5FD]" />
                  <span className="text-[11px] font-semibold text-[#B0A0D8] tracking-wide">IMAGE UPLOAD</span>
                  <span className="text-[10px] text-[#C4B5FD]">PNG, JPG up to 5MB</span>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
            {imageError && <p className="text-xs text-red-400 mt-1">{imageError}</p>}
          </div>

          {/* 用途 */}
          <div className={cardCls}>
            <label className={labelCls}>用途</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_OPTIONS.map(name => {
                const style = CATEGORY_STYLE[name as CategoryOption]
                const selected = selectedCats.includes(name)
                return (
                  <button type="button" key={name} onClick={() => toggleCat(name)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                      selected ? `${style.bg} ${style.text}` : 'bg-[#F5F2FB] text-[#9B8DC4] hover:bg-[#EDE8F7]'
                    }`}>
                    {name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* タグ */}
          <div className={cardCls}>
            <label className={labelCls}>Tags</label>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {allTags.map(t => {
                  const selected = selectedTags.includes(t.name)
                  return (
                    <button type="button" key={t.id} onClick={() => toggleTag(t.name)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-lg border transition ${
                        selected ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#6B50B8] font-semibold' : 'border-[#EDE8F7] text-[#B0A0D8] hover:border-[#C4B5FD]'
                      }`}>
                      #{t.name}
                    </button>
                  )
                })}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 p-2 border border-[#EDE8F7] rounded-xl min-h-[40px] bg-[#FAFAFE] focus-within:border-[#C4B5FD] transition">
              {selectedTags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 bg-[#EDE8F7] text-[#6B50B8] text-[11px] px-2 py-0.5 rounded-lg">
                  #{t}
                  <button type="button" onClick={() => setSelectedTags(prev => prev.filter(x => x !== t))}>
                    <X size={10} />
                  </button>
                </span>
              ))}
              <div className="relative flex-1 min-w-[80px]">
                <input type="text" value={tagInput}
                  onChange={e => { setTagInput(e.target.value); setShowSuggestions(true) }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (tagInput.trim()) addTagFromInput() } }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder={selectedTags.length === 0 ? 'タグを追加…' : ''}
                  className="w-full text-xs outline-none bg-transparent text-[#2F2F2F] placeholder-[#C4B5FD] py-0.5" />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 top-full mt-1 z-10 border border-[#EDE8F7] rounded-xl shadow-sm bg-white overflow-hidden min-w-[130px]">
                    {filteredSuggestions.slice(0, 6).map(t => (
                      <button type="button" key={t.id} onMouseDown={() => { toggleTag(t.name); setTagInput('') }}
                        className="block w-full text-left text-xs px-3 py-2 text-[#2F2F2F] hover:bg-[#F5F2FB]">
                        #{t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 参考元・URL */}
          <div className={cardCls}>
            <label className={labelCls}>出典 / Source</label>
            <input type="text" name="source" defaultValue={defaultValues.source ?? ''}
              placeholder="書籍名・サイト名など" className={`${inputCls} mb-3`} />

            <label className={labelCls}>参考URL</label>
            <div className="space-y-2 mb-2">
              {urls.map((u, i) => (
                <div key={i} className="flex gap-1.5 items-center">
                  <Link2 size={13} className="text-[#C4B5FD] shrink-0" />
                  <input type="text" value={u.url}
                    onChange={e => setUrls(prev => prev.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                    placeholder="https://…"
                    className="flex-1 px-2 py-1.5 border border-[#EDE8F7] rounded-lg text-xs text-[#2F2F2F] outline-none focus:border-[#C4B5FD] bg-white placeholder-[#C4B5FD]" />
                  <button type="button" onClick={() => setUrls(prev => prev.filter((_, j) => j !== i))}>
                    <X size={13} className="text-[#DDD6FE] hover:text-red-400 transition" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setUrls(prev => [...prev, { url: '', label: '' }])}
              className="flex items-center gap-1 text-xs text-[#C4B5FD] hover:text-[#9B8DC4] transition">
              <Plus size={12} /> URLを追加
            </button>
          </div>

        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex flex-col items-center gap-3 mt-6 pb-4">
        <button type="submit" disabled={pending}
          className="flex items-center gap-2 px-10 py-3 bg-[#6B50B8] hover:bg-[#5A42A0] text-white text-sm font-semibold rounded-full transition disabled:opacity-50 shadow-md">
          <span className="text-[#C4B5FD]">✦</span>
          {pending ? '保存中…' : '保存する'}
        </button>
        <a href="/home" className="text-xs text-[#C4B5FD] hover:text-[#9B8DC4] transition">キャンセル</a>
      </div>
    </form>
  )
}
