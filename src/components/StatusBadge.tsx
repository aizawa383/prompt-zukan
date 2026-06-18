import { Status, STATUS_STYLE } from '@/lib/types'

export default function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLE[status]
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}
