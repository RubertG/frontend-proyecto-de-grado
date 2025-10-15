import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ message: 'Missing credentials' }, { status: 400 })
    }
    const supabase = createClient(url, anon, { auth: { persistSession: false } })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session?.access_token) {
      return NextResponse.json({ message: error?.message || 'Invalid credentials' }, { status: 401 })
    }
    const token = data.session.access_token
    const res = NextResponse.json({ ok: true, token }) // token expuesto sólo para entorno dev; remover en producción si deseas
    res.cookies.set('auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 4, // 4h
    })
    return res
  } catch {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
