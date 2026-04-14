'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[PublicError]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-black text-[#dc2626]">¡Oops!</p>
      <h1 className="mt-4 text-xl font-bold text-white">
        No se pudo cargar esta página
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Es posible que sea un problema temporal. Inténtalo de nuevo.
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
