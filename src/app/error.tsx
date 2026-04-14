'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-4 text-center">
      <p className="text-6xl font-black text-[#dc2626]">500</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Algo ha fallado</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Ha ocurrido un error inesperado. Inténtalo de nuevo o vuelve al inicio.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-[#dc2626] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-lg border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
