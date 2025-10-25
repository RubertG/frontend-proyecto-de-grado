import { NextResponse, type NextRequest } from 'next/server'

// Cookie donde esperamos el token de Supabase (ya lo busca el http-client)
const AUTH_COOKIE = 'auth_token'
// Rutas actualizadas (antes se usaba '/auth/login' ó '/autorizacion/...')
const LOGIN_PATH = '/autenticacion/iniciar-sesion'
const HOME_PATH = '/'
const ADMIN_PREFIX = '/admin'

const PUBLIC_PATHS = new Set([
  '/',
  '/autenticacion/iniciar-sesion',
  '/autenticacion/registro'
])

function isAdminRoute(pathname: string) {
  return pathname === ADMIN_PREFIX || pathname.startsWith(ADMIN_PREFIX + '/')
}

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true
  return false
}

async function fetchUser(token: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1'
  
  try {
    const res = await fetch(base + '/users/me', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    })
    
    if (!res.ok) {
      console.log(`[fetchUser] Failed: ${res.status}`)
      return null
    }
    
    const user = (await res.json()) as { id: string; role: string }
    console.log(`[fetchUser] Success: role=${user.role}`)
    return user
  } catch (error) {
    console.error(`[fetchUser] Error:`, error)
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(AUTH_COOKIE)?.value
  
  // Logging simplificado
  if (isAdminRoute(pathname)) {
    console.log(`[Middleware] Admin route: ${pathname}, token: ${token ? 'present' : 'missing'}`)
  }

  // Rutas públicas accesibles siempre
  if (isPublic(pathname) && !isAdminRoute(pathname)) {
    return NextResponse.next()
  }

  // Necesitamos token para cualquier ruta admin
  if (isAdminRoute(pathname)) {
    if (!token) {
      console.log(`[Middleware] No token, redirecting to login`)
      return redirectToLogin(req)
    }
    const user = await fetchUser(token)
    if (!user) {
      console.log(`[Middleware] Invalid token, redirecting to login`)
      return redirectToLogin(req)
    }
    if (user.role !== 'admin') {
      console.log(`[Middleware] User role: ${user.role}, not admin, redirecting home`)
      return redirectToHome(req)
    }
    console.log(`[Middleware] Admin access granted for user: ${user.id}`)
    
    // Agregar headers para debug
    const response = NextResponse.next()
    response.headers.set('X-Auth-Status', 'authenticated')
    response.headers.set('X-User-Role', user.role)
    return response
  }

  // (Futuro) otras rutas semi-protegidas podrían verificarse aquí
  return NextResponse.next()
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone()
  url.pathname = LOGIN_PATH
  url.searchParams.set('redirect', req.nextUrl.pathname)
  return NextResponse.redirect(url)
}

function redirectToHome(req: NextRequest) {
  const url = req.nextUrl.clone()
  url.pathname = HOME_PATH
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/autenticacion/iniciar-sesion',
    '/autenticacion/registro'
  ]
}
