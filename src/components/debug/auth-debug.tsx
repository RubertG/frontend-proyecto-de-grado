"use client";
import { useEffect } from 'react';

export function AuthDebug() {
  useEffect(() => {
    // Debug cookies en el cliente
    const cookies = document.cookie;
    console.log('[AuthDebug] Document cookies:', cookies);
    
    // Debug localStorage para Supabase
    const supabaseSession = localStorage.getItem('sb-adgkxyqgfzaarsvbmkqv-auth-token');
    console.log('[AuthDebug] Supabase localStorage:', supabaseSession ? 'present' : 'missing');
  }, []);

  return null; // No renderiza nada
}