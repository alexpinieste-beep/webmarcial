'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteFighter } from './actions'

type Props = {
  fighterId: string
  fighterName: string
}

export function DeleteFighterButton({ fighterId, fighterName }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar a "${fighterName}"?\n\nEsta acción no se puede deshacer y borrará también todos sus registros deportivos.`
    )
    if (!confirmed) return

    startTransition(async () => {
      const result = await deleteFighter(fighterId)
      if (result.error) {
        alert(`Error: ${result.error}`)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-md border border-[#dc2626] px-3 py-1.5 text-xs font-medium text-[#dc2626] transition-colors hover:bg-[#dc2626] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? 'Eliminando…' : 'Eliminar'}
    </button>
  )
}
