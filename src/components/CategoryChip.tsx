import { CATEGORY_STYLE, CategoryOption } from '@/lib/types'

type Props = {
  name: string
  size?: 'sm' | 'md'
}

export default function CategoryChip({ name, size = 'sm' }: Props) {
  const style = CATEGORY_STYLE[name as CategoryOption] ?? { bg: 'bg-gray-100', text: 'text-gray-500' }
  const padding = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-xs'
  return (
    <span className={`inline-block font-medium rounded-full ${padding} ${style.bg} ${style.text}`}>
      {name}
    </span>
  )
}
