'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteFighter } from '../../actions'

type Props = {
  fighterId: string
  fighterName: string
}

export function DeleteFighterSection({ fighterId, fighterName }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar a "${fighterName}"?\n\nEsta acción no se puede deshacer y borrará también todos sus registros deportivos.`
    )
    if (!confirmed) return

    startTransition(async () => {
      const result = await deleteFighter(fighterId)
      if (result?.error) {
        alert(`Error: ${result.error}`)
      } else {
        router.push('/dashboard/luchadores')
      }
    })
  }

  return (
    <div className="rounded-xl border border-red-900/50 bg-[#18181b] p-6">
      <h2 className="mb-1 text-base font-semibold text-white">Zona de peligro</h2>
      <p className="mb-4 text-sm text-[#a1a1aa]">
        Eliminar este luchador borrará también todos sus perfiles deportivos, títulos y rankings. Esta acción no se puede deshacer.
      </p>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-md border border-[#dc2626] px-4 py-2 text-sm font-semibold text-[#dc2626] transition-colors hover:bg-[#dc2626] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Eliminando…' : `Eliminar luchador`}
      </button>
    </div>
  )
}
