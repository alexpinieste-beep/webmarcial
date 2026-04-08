'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPassword, type ActionState } from '../actions'

const initialState: ActionState = null

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPassword, initialState)

  if (state?.success) {
    return (
      <div className="rounded-lg border border-[#262626] bg-[#111111] p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-900/30">
            <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <h2 className="text-lg font-bold text-[#ededed]">Revisa tu email</h2>
        <p className="mt-2 text-sm text-[#71717a]">
          {state.success}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-[#dc2626] hover:text-[#b91c1c] transition-colors"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[#262626] bg-[#111111] p-8">
      <h1 className="text-xl font-bold text-[#ededed]">Recuperar contraseña</h1>
      <p className="mt-1 text-sm text-[#71717a]">
        Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-[#ededed]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@email.com"
            className="w-full rounded-md border border-[#3f3f46] bg-[#27272a] px-3 py-2 text-sm text-[#ededed] placeholder-[#71717a] focus:border-[#dc2626] focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
          />
        </div>

        {/* Error */}
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
          {pending ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#71717a]">
        <Link
          href="/login"
          className="font-medium text-[#dc2626] hover:text-[#b91c1c] transition-colors"
        >
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  )
}
