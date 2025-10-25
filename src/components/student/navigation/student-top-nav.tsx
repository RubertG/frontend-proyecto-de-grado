"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/features/auth/hooks/use-user';

import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

import { useState } from 'react';

const NAV_ITEMS: { href: string; label: string; exact?: boolean; public?: boolean }[] = [
  { href: '/', label: 'Inicio', exact: true, public: true },
  { href: '/guias', label: 'Guías' },
  { href: '/progreso', label: 'Progreso' },
];

export function StudentTopNav() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [loggingOut, setLoggingOut] = useState(false);


  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    
    // Usar la función logout del hook useUser
    await logout();
    
    setLoggingOut(false);
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
