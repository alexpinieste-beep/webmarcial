'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  gymId: string
  gymName: string
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

const INPUT_CLASS =
  'w-full rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]'

export default function LeadCaptureForm({ gymId, gymName }: Props) {
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [charCount, setCharCount] = useState(0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')

    const form = e.currentTarget
    const data = {
      gym_id: gymId,
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value.trim() || undefined,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim() || undefined,
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setState('success')
      } else {
        const json = await res.json().catch(() => ({}))
        setErrorMsg(json.error ?? 'Ha ocurrido un error. Inténtalo de nuevo.')
        setState('error')
      }
    } catch {
      setErrorMsg('No se pudo conectar con el servidor. Inténtalo de nuevo.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <section className="rounded-xl border border-[#dc2626]/30 bg-[#18181b] p-6">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dc2626]/15">
            <svg
              className="h-6 w-6 text-[#dc2626]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-base font-semibold text-white">
            ¡Mensaje enviado! El gimnasio se pondrá en contacto contigo pronto.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-[#dc2626]/30 bg-[#18181b] p-6">
      <h2 className="text-xl font-bold text-white">Contactar con {gymName}</h2>
      <p className="mt-1 text-sm text-[#a1a1aa]">
        Rellena el formulario y el gimnasio se pondrá en contacto contigo.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        {/* Name */}
        <div>
          <label htmlFor="lead-name" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Nombre completo <span className="text-[#dc2626]">*</span>
          </label>
          <input
            id="lead-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            placeholder="Tu nombre"
            className={INPUT_CLASS}
            disabled={state === 'loading'}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="lead-email" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Email <span className="text-[#dc2626]">*</span>
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
            className={INPUT_CLASS}
            disabled={state === 'loading'}
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="lead-phone" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Teléfono <span className="text-zinc-500 font-normal">(opcional)</span>
          </label>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            maxLength={20}
            placeholder="+34 600 000 000"
            className={INPUT_CLASS}
            disabled={state === 'loading'}
          />
        </div>

        {/* Message */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="lead-message" className="text-sm font-medium text-zinc-300">
              Mensaje <span className="text-zinc-500 font-normal">(opcional)</span>
            </label>
            <span
              className={cn(
                'text-xs tabular-nums',
                charCount > 450 ? 'text-[#dc2626]' : 'text-zinc-500'
              )}
            >
              {charCount}/500
            </span>
          </div>
          <textarea
            id="lead-message"
            name="message"
            rows={4}
            maxLength={500}
            placeholder="¿En qué estás interesado? Cuéntanos un poco sobre ti..."
            onChange={(e) => setCharCount(e.target.value.length)}
            className={cn(INPUT_CLASS, 'resize-none')}
            disabled={state === 'loading'}
          />
        </div>

        {/* Privacy checkbox */}
        <div className="flex items-start gap-3">
          <input
            id="lead-privacy"
            name="privacy"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-600 bg-[#27272a] accent-[#dc2626]"
            disabled={state === 'loading'}
          />
          <label htmlFor="lead-privacy" className="text-xs leading-relaxed text-zinc-400">
            Acepto que mis datos sean utilizados para contactarme sobre este gimnasio
          </label>
        </div>

        {/* Error message */}
        {state === 'error' && errorMsg && (
          <p className="rounded-lg border border-red-700/40 bg-red-900/20 px-3 py-2.5 text-sm text-red-400">
            {errorMsg}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={state === 'loading'}
          className="w-full rounded-lg bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b91c1c] focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:ring-offset-2 focus:ring-offset-[#18181b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === 'loading' ? 'Enviando…' : 'Enviar mensaje'}
        </button>
      </form>
    </section>
  )
}
