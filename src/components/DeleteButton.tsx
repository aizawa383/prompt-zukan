'use client'

import { deleteLog } from '@/app/actions'

export default function DeleteButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!confirm('このログを削除しますか？')) return
    await deleteLog(id)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="bg-red-50 hover:bg-red-100 text-red-400 text-sm px-4 py-2 rounded-full transition"
    >
      削除
    </button>
  )
}
