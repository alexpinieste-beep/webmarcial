'use client'

import { useActionState, useState } from 'react'
import { updatePassword, type ActionState } from '../../actions'

const initialState: ActionState = null

export default function ConfirmResetPage() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value
    if (password !== confirm) {
      e.preventDefault()
      setConfirmError('Las contraseñas no coinciden.')
      return
    }
    setConfirmError(null)
  }

  return (
    <div className="rounded-lg border border-[#262626] bg-[#111111] p-8">
      <h1 className="text-xl font-bold text-[#ededed]">Nueva contraseña</h1>
      <p className="mt-1 text-sm text-[#71717a]">
        Elige una nueva contraseña para tu cuenta.
      </p>

      <form action={formAction} onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Nueva contraseña */}
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-[#ededed]">
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-md border border-[#3f3f46] bg-[#27272a] px-3 py-2 pr-10 text-sm text-[#ededed] placeholder-[#71717a] focus:border-[#dc2626] focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-[#71717a] hover:text-[#ededed]"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Confirmar contraseña */}
        <div className="space-y-1">
          <label htmlFor="confirm" className="text-sm font-medium text-[#ededed]">
            Confirmar contraseña
          </label>
          <div className="relative">
            <input
              id="confirm"
              name="confirm"
              type={showConfirm ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              className="w-full rounded-md border border-[#3f3f46] bg-[#27272a] px-3 py-2 pr-10 text-sm text-[#ededed] placeholder-[#71717a] focus:border-[#dc2626] focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-[#71717a] hover:text-[#ededed]"
              aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirm ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Errores */}
        {confirmError && (
          <p className="text-sm text-red-400" role="alert">
            {confirmError}
          </p>
        )}
        {state?.error && (
          <p className="text-sm text-red-400" role="alert">
            {state.error}
          </p>
        )}

        {/* Botón submit */}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b91c1c] disabled:opacity-50 transition-colors"
        >
          {pending ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>
      </form>
    </div>
  )
}
