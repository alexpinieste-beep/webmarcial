import Link from 'next/link'
import Image from 'next/image'
import type { Sport } from '@/types/database'
import { cn } from '@/lib/utils'

type SportCardProps = {
  sport: Sport
  className?: string
}

export function SportCard({ sport, className }: SportCardProps) {
  return (
    <Link
      href={`/deportes/${sport.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl bg-[#18181b] border border-zinc-800',
        'hover:border-red-600 transition-colors duration-200',
        className
      )}
    >
      {/* Image / placeholder */}
      <div className="relative h-40 w-full overflow-hidden bg-zinc-900">
        {sport.image_url ? (
          <Image
            src={sport.image_url}
            alt={sport.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-5xl select-none">🥊</span>
          </div>
        )}
        {/* Red overlay on hover */}
        <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-colors duration-200" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-lg font-semibold text-[#ededed] group-hover:text-red-400 transition-colors">
          {sport.name}
        </h3>
        {sport.description && (
          <p className="mt-1 text-sm text-zinc-400 line-clamp-2">
            {sport.description}
          </p>
        )}
      </div>

      {/* Bottom accent */}
      <div className="h-0.5 w-0 bg-red-600 group-hover:w-full transition-all duration-300" />
    </Link>
  )
}
