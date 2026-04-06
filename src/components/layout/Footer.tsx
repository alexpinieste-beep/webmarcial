import Link from 'next/link'

const deportesLinks = [
  { label: 'Muay Thai', href: '/deportes/muay-thai' },
  { label: 'Kickboxing', href: '/deportes/kickboxing' },
  { label: 'K1', href: '/deportes/k1' },
  { label: 'MMA', href: '/deportes/mma' },
  { label: 'Boxeo', href: '/deportes/boxeo' },
  { label: 'Jiu-Jitsu', href: '/deportes/jiu-jitsu' },
]

const plataformaLinks = [
  { label: 'Rankings', href: '/rankings' },
  { label: 'Eventos', href: '/eventos' },
  { label: 'Gimnasios', href: '/gimnasios' },
  { label: 'Zonas', href: '/zonas' },
]

const legalLinks = [
  { label: 'Privacidad', href: '/privacidad' },
  { label: 'Términos', href: '/terminos' },
  { label: 'Cookies', href: '/cookies' },
]

export default function Footer() {
  return (
    <footer className="border-t border-[#262626] bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-1 text-xl font-bold tracking-tight">
              <span className="text-[#dc2626]">Web</span>
              <span className="text-white">Marcial</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-gray-400">
              La plataforma de referencia para los deportes de contacto en España. Rankings, eventos, gimnasios y comunidad.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-4">
              <a
                href="https://instagram.com/webmarcial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de WebMarcial"
                className="text-gray-500 transition-colors hover:text-white"
              >
                {/* Instagram */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://twitter.com/webmarcial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter de WebMarcial"
                className="text-gray-500 transition-colors hover:text-white"
              >
                {/* Twitter / X */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://youtube.com/@webmarcial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube de WebMarcial"
                className="text-gray-500 transition-colors hover:text-white"
              >
                {/* YouTube */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path d="m10 15 5-3-5-3z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/webmarcial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de WebMarcial"
                className="text-gray-500 transition-colors hover:text-white"
              >
                {/* Facebook */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Deportes column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-200">
              Deportes
            </h3>
            <ul className="mt-4 space-y-2.5">
              {deportesLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Plataforma column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-200">
              Plataforma
            </h3>
            <ul className="mt-4 space-y-2.5">
              {plataformaLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-200">
              Legal
            </h3>
            <ul className="mt-4 space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-[#262626] pt-6 text-center">
          <p className="text-sm text-gray-500">
            © 2025 WebMarcial. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
