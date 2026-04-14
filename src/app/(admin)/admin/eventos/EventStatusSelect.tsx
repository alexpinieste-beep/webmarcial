'use client'

import { useTransition } from 'react'
import { setEventStatus } from './actions'

type Status = 'draft' | 'published' | 'completed' | 'cancelled'

export function EventStatusSelect({
  eventId,
  current,
}: {
  eventId: string
  current: Status
}) {
  const [pending, startTransition] = useTransition()

  return (
    <select
      disabled={pending}
      value={current}
      onChange={(e) =>
        startTransition(() => setEventStatus(eventId, e.target.value as Status))
      }
      className="rounded-md border border-[#27272a] bg-[#18181b] px-2 py-1.5 text-xs text-[#a1a1aa] outline-none transition-colors hover:border-[#3f3f46] focus:border-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="draft">Borrador</option>
      <option value="published">Publicado</option>
      <option value="completed">Finalizado</option>
      <option value="cancelled">Cancelado</option>
    </select>
  )
}
