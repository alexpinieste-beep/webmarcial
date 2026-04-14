'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signIn, signInWithGoogle, type ActionState } from '../actions'

const initialState: ActionState = null

function GoogleIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="rounded-lg border border-[#262626] bg-[#111111] p-8">
      <h1 className="text-xl font-bold text-[#ededed]">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-[#71717a]">
        Accede a tu cuenta de WebMarcial.
      </p>

      {/* Error de callback (ej. tras OAuth fallido) */}
      {typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('error') && (
          <p className="mt-4 text-sm text-red-400">
            Error de autenticación. Inténtalo de nuevo.
          </p>
        )}

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
            placeholder="tu email"
            className="w-full rounded-md border border-[#3f3f46] bg-[#27272a] px-3 py-2 text-sm text-[#ededed] placeholder-[#71717a] focus:border-[#dc2626] focus:outline-none focus:ring-1 focus:ring-[#dc2626]"
          />
        </div>

        {/* Contraseña */}
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-[#ededed]">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="••••••••"
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

        {/* Error */}
        {state?.error && (
          <p className="text-sm text-red-400" role="alert">
            {state.error}
          </p>
        )}

        {/* Enlace olvidé contraseña */}
        <div className="flex justify-end">
          <Link
            href="/reset-password"
            className="text-xs text-[#71717a] hover:text-[#ededed] transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Botón submit */}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b91c1c] disabled:opacity-50 transition-colors"
        >
          {pending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {/* Separador */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#3f3f46]" />
        <span className="text-xs text-[#71717a]">o</span>
        <div className="h-px flex-1 bg-[#3f3f46]" />
      </div>

      {/* Google OAuth */}
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-[#3f3f46] bg-[#27272a] px-4 py-2 text-sm font-medium text-[#ededed] hover:bg-[#3f3f46] transition-colors"
        >
          <GoogleIcon />
          Continuar con Google
        </button>
      </form>

      {/* Registro */}
      <p className="mt-6 text-center text-sm text-[#71717a]">
        ¿No tienes cuenta?{' '}
        <Link
          href="/registro"
          className="font-medium text-[#dc2626] hover:text-[#b91c1c] transition-colors"
        >
          Regístrate
        </Link>
      </p>
    </div>
  )
}
