import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, cacheHeaders) {
          // Propagate updated cookies to the request so downstream
          // server code sees the refreshed session.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          // Re-create the response with the updated request so that
          // any rewrite/redirect further down the chain carries the
          // new cookies.
          supabaseResponse = NextResponse.next({ request })

          // Write the cookies to the response so the browser stores them.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )

          // Apply cache-control headers supplied by @supabase/ssr v0.10+
          // to prevent CDNs from caching auth responses.
          if (cacheHeaders) {
            Object.entries(cacheHeaders).forEach(([key, value]) =>
              supabaseResponse.headers.set(key, value)
            )
          }
        },
      },
    }
  )

  // IMPORTANT: call getUser() to refresh the session token.
  // Do NOT use getSession() — it is unverified and must not be used
  // for authorization decisions (see @supabase/ssr README).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const isProtected =
    pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  const isAuthPage = pathname === '/login' || pathname === '/registro'

  // Redirect unauthenticated users away from protected routes.
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages.
  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

// Run proxy on every route except static assets.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
