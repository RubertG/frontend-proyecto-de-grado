import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    console.log(`[Login API] Attempt for email: ${email}`)
    
    if (!email || !password) {
      console.log(`[Login API] Missing credentials`)
      return NextResponse.json({ message: 'Missing credentials' }, { status: 400 })
    }
    
    const supabase = createClient(url, anon, { auth: { persistSession: false } })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error || !data.session?.access_token) {
      console.log(`[Login API] Auth failed: ${error?.message || 'Invalid credentials'}`)
      return NextResponse.json({ message: error?.message || 'Invalid credentials' }, { status: 401 })
    }
    
    const token = data.session.access_token
    console.log(`[Login API] Auth success, setting cookie`)
    
    const res = NextResponse.json({ ok: true, token }) // token expuesto sólo para entorno dev; remover en producción si deseas
    
    // Configuración de cookies compatible con desarrollo y producción
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = {
      httpOnly: false, // Permitir acceso desde JavaScript para autenticación del cliente
      sameSite: 'lax' as const,
      // Solo usar secure si realmente estás en HTTPS en producción
      secure: isProduction && process.env.FORCE_HTTPS === 'true',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días (más tiempo en producción)
    }
    
    res.cookies.set('auth_token', token, cookieOptions)
    console.log(`[Login API] Cookie set with options:`, cookieOptions)
    return res
  } catch (error) {
    console.error(`[Login API] Server error:`, error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
