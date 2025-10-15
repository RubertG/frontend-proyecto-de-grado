"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSessionStore } from '@/shared/stores/session-store';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';
import { supabaseBrowser } from '@/shared/supabase/client';
import { useRouter } from 'next/navigation';

const NAV_ITEMS: { href: string; label: string; exact?: boolean; public?: boolean }[] = [
  { href: '/', label: 'Inicio', exact: true, public: true },
  { href: '/guias', label: 'Guías' },
  { href: '/progreso', label: 'Progreso' },
];

export function StudentTopNav() {
  const pathname = usePathname();
  const user = useSessionStore(s => s.user);
  const setLoggedOut = useSessionStore(s => s.logOut);
  const qc = useQueryClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // 1. Cerrar sesión Supabase (revoca refresh token local)
      await supabaseBrowser.auth.signOut();
      // 2. Golpear endpoint para limpiar cookie auth_token (si se usa server-side)
      try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
      // 3. Limpiar caches
      qc.clear();
      // 4. Marcar store como loggedOut
      setLoggedOut();
      // 5. Forzar refresh de la ruta para evitar hidratación con datos previos
      try { router.refresh(); } catch {}
      toast.success('Sesión cerrada');
    } catch {
      toast.error('No se pudo cerrar la sesión');
    } finally {
      setLoggingOut(false);
    }
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-14 flex items-center gap-6 px-4 max-w-screen-2xl mx-auto">
        <Link href="/" className="font-semibold text-sm tracking-tight">Plataforma</Link>
        <nav className="flex items-center gap-1 text-sm">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1.5 rounded-md transition-colors hover:text-foreground',
                isActive(item.href, item.exact)
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'px-3 py-1.5 rounded-md transition-colors hover:text-foreground',
                isActive('/admin') ? 'bg-muted text-foreground' : 'text-muted-foreground'
              )}
            >Administración</Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground max-w-[160px] truncate" title={user.email}>{user.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
                aria-busy={loggingOut}
                className={loggingOut ? 'pointer-events-none opacity-70' : ''}
              >
                {loggingOut ? 'Saliendo…' : 'Salir'}
              </Button>
            </div>
          ) : (
            <>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/autenticacion/iniciar-sesion">Iniciar sesión</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/autenticacion/registro">Registrarse</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
