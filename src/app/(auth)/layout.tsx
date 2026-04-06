export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <a href="/" className="inline-flex items-center gap-1 text-2xl font-bold tracking-tight">
            <span className="text-[#dc2626]">Web</span>
            <span className="text-white">Marcial</span>
          </a>
        </div>
        {children}
      </div>
    </div>
  )
}
