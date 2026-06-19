'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-[#9B8DC4] hover:text-[#6B50B8] border border-[#EDE8F7] hover:border-[#C4B5FD] px-2.5 py-1 rounded-lg transition">
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'コピー済' : 'Copy'}
    </button>
  )
}
