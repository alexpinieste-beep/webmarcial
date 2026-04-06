import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    template: '%s | WebMarcial',
    default: 'WebMarcial — Deportes de Contacto en España',
  },
  description:
    'La plataforma líder de deportes de contacto en España. Rankings, eventos, gimnasios y zonas de Muay Thai, Kickboxing, K1, MMA, Boxeo y Jiu-Jitsu.',
  keywords: [
    'Muay Thai',
    'Kickboxing',
    'K1',
    'MMA',
    'Boxeo',
    'Jiu-Jitsu',
    'deportes de contacto',
    'España',
    'rankings',
    'eventos',
    'gimnasios',
  ],
  authors: [{ name: 'WebMarcial' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'WebMarcial',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-[#0a0a0a] text-[#ededed] antialiased">
        {children}
      </body>
    </html>
  )
}
