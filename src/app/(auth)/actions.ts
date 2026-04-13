'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Traduce los mensajes de error de Supabase Auth al español
function traducirError(message: string): string {
  const errores: Record<string, string> = {
    'Invalid login credentials': 'Email o contraseña incorrectos.',
    'Email not confirmed': 'Debes confirmar tu email antes de iniciar sesión.',
    'User already registered': 'Ya existe una cuenta con ese email.',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
    'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos.',
    'For security purposes, you can only request this after': 'Por seguridad, espera antes de volver a solicitarlo.',
    'Token has expired or is invalid': 'El enlace ha expirado o no es válido.',
    'New password should be different from the old password': 'La nueva contraseña debe ser diferente a la anterior.',
    'Signup requires a valid password': 'La contraseña no es válida.',
    'Unable to validate email address: invalid format': 'El formato del email no es válido.',
  }

  for (const [key, value] of Object.entries(errores)) {
    if (message.includes(key)) return value
  }

  return 'Ha ocurrido un error. Inténtalo de nuevo.'
}

export type ActionState = {
  error?: string
  success?: string
} | null

// ----- Sign In -----
export async function signIn(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: traducirError(error.message) }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ----- Sign Up -----
export async function signUp(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  })

  if (error) {
    console.error('[signUp error]', error.message, error.status)
    return { error: traducirError(error.message) }
  }

  return { success: 'Revisa tu email para confirmar tu cuenta.' }
}

// ----- Google OAuth -----
// Returns void so it can be used directly as a <form action>.
// Errors from OAuth initiation cause a redirect to /login?error=oauth_error.
export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  })

  if (error || !data.url) {
    redirect('/login?error=oauth_error')
  }

  redirect(data.url)
}

// ----- Sign Out -----
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

// ----- Reset Password (enviar email) -----
export async function resetPassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get('email') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/reset-password/confirm`,
  })

  if (error) {
    return { error: traducirError(error.message) }
  }

  // No revelamos si el email existe o no (seguridad)
  return {
    success: 'Si el email está registrado, recibirás un enlace en breve.',
  }
}

// ----- Update Password (tras reset) -----
export async function updatePassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: traducirError(error.message) }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
