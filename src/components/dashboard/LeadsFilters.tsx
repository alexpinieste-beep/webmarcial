'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type Counts = {
  total: number
  new: number
  contacted: number
  converted: number
  closed: number
}

type Props = {
  currentEstado?: string
  counts: Counts
}

const TABS = [
  { value: '', label: 'Todos', key: 'total' },
  { value: 'new', label: 'Nuevos', key: 'new' },
  { value: 'contacted', label: 'Contactados', key: 'contacted' },
  { value: 'converted', label: 'Convertidos', key: 'converted' },
  { value: 'closed', label: 'Cerrados', key: 'closed' },
] as const

export default function LeadsFilters({ currentEstado, counts }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleTab(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('estado', value)
    } else {
      params.delete('estado')
    }
    router.replace(`/dashboard/leads?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive = (currentEstado ?? '') === tab.value
        const count = counts[tab.key]
        return (
          <button
            key={tab.value}
            onClick={() => handleTab(tab.value)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#dc2626] text-white'
                : 'border border-[#27272a] bg-[#18181b] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-white'
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#27272a] text-[#71717a]'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
