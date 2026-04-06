import Link from 'next/link'
import type { Event } from '@/types/database'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

type EventCardProps = {
  event: Event
  className?: string
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

const statusVariant: Record<
  Event['status'],
  {
    label: string
    variant: 'default' | 'featured' | 'pro' | 'basic' | 'upcoming' | 'completed'
  }
> = {
  draft: { label: 'Borrador', variant: 'default' },
  published: { label: 'Próximo', variant: 'upcoming' },
  completed: { label: 'Completado', variant: 'completed' },
  cancelled: { label: 'Cancelado', variant: 'featured' },
}

export function EventCard({ event, className }: EventCardProps) {
  const status = statusVariant[event.status]

  return (
    <Link
      href={`/eventos/${event.slug}`}
      className={cn(
        'group flex flex-col rounded-xl bg-[#18181b] border border-zinc-800 overflow-hidden',
        'hover:border-red-600 transition-colors duration-200',
        className
      )}
    >
      {/* Poster / header band */}
      {event.poster_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <div className="relative h-36 w-full overflow-hidden bg-zinc-900">
          <img
            src={event.poster_url}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] to-transparent" />
        </div>
      ) : (
        <div className="h-2 w-full bg-red-600" />
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* Status + Sport badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant={status.variant}>{status.label}</Badge>
          {event.sports && (
            <Badge variant="default">{event.sports.name}</Badge>
          )}
          {event.zones && (
            <Badge variant="default">{event.zones.name}</Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-[#ededed] group-hover:text-red-400 transition-colors line-clamp-2 mb-2">
          {event.title}
        </h3>

        {/* Date */}
        <p className="text-xs text-zinc-400 mb-1">
          {formatDate(event.event_date)}
        </p>

        {/* Venue */}
        {event.venue && (
          <p className="text-xs text-zinc-500 line-clamp-1">
            {event.venue}
            {event.address ? ` — ${event.address}` : ''}
          </p>
        )}
      </div>

      {/* Bottom accent */}
      <div className="h-0.5 w-0 bg-red-600 group-hover:w-full transition-all duration-300" />
    </Link>
  )
}

export default EventCard
