import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Página no encontrada | WebMarcial',
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-4 text-center">
      <p className="text-8xl font-black text-[#dc2626]/20 select-none">404</p>
      <h1 className="mt-2 text-2xl font-bold text-white">
        Página no encontrada
      </h1>
      <p className="mt-3 max-w-sm text-sm text-zinc-400">
        La página que buscas no existe o ha sido movida. Usa el menú de navegación
        para encontrar lo que necesitas.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-lg bg-[#dc2626] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Ir al inicio
        </Link>
        <Link
          href="/gimnasios"
          className="rounded-lg border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          Ver gimnasios
        </Link>
        <Link
          href="/rankings/mma"
          className="rounded-lg border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          Ver rankings
        </Link>
      </div>
    </div>
  )
}
