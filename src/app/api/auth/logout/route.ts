import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  
  // Usar la misma configuración que login pero con maxAge: 0 para eliminar la cookie
  const isProduction = process.env.NODE_ENV === 'production'
  res.cookies.set('auth_token', '', { 
    httpOnly: false, // Mantener consistencia con login
    sameSite: 'lax',
    secure: isProduction && process.env.FORCE_HTTPS === 'true',
    path: '/', 
    maxAge: 0 
  })
  return res
}
