"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/features/auth/hooks/use-user';

import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS: { href: string; label: string; exact?: boolean; public?: boolean }[] = [
  { href: '/', label: 'Inicio', exact: true, public: true },
  { href: '/guias', label: 'Guías' },
  { href: '/progreso', label: 'Progreso' },
];

export function StudentTopNav() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [renderMobile, setRenderMobile] = useState(false);
  const [entering, setEntering] = useState(false);
  const [exiting, setExiting] = useState(false);


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

  // Bloquear scroll del body mientras el menú móvil esté abierto o saliendo con animación.
  useEffect(() => {
    if (mobileOpen || exiting) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prevOverflow; };
    }
    return () => {};
  }, [mobileOpen, exiting]);

  // Cerrar con Escape cuando esté abierto.
  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, renderMobile]);

  // Enfocar el primer elemento dentro del panel al abrir.
  useEffect(() => {
    if (mobileOpen && panelRef.current) {
      const firstInteractive = panelRef.current.querySelector<HTMLElement>('a, button, input, select, textarea');
      firstInteractive?.focus();
    }
  }, [mobileOpen]);

  // Evitar portal durante SSR; marcar montado en cliente
  useEffect(() => { setMounted(true); }, []);

  // Controlar renderizado y animaciones de entrada/salida (array de dependencias estable)
  useEffect(() => {
    if (mobileOpen) {
      setRenderMobile(true);
      setExiting(false);
      setEntering(false);
      const id = setTimeout(() => setEntering(true), 20); // siguiente frame para transiciones
      return () => clearTimeout(id);
    }
    // Animación de cierre únicamente si el panel aún está renderizado
    if (!mobileOpen && renderMobile) {
      setEntering(false);
      setExiting(true);
      const id = setTimeout(() => { setRenderMobile(false); setExiting(false); }, 250);
      return () => clearTimeout(id);
    }
  }, [mobileOpen, renderMobile]);

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="h-14 flex items-center gap-6 px-4 max-w-screen-2xl mx-auto">
        <Link href="/" className="font-semibold text-sm tracking-tight">Plataforma</Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
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
          {/* Toggle menú móvil */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {/* Acciones de sesión sólo visibles en desktop */}
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs text-muted-foreground max-w-40 truncate" title={user.email}>{user.name}</span>
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
            <div className="hidden md:flex items-center gap-2">
              <Button size="sm" variant="ghost" asChild>
                <Link href="/autenticacion/iniciar-sesion">Iniciar sesión</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/autenticacion/registro">Registrarse</Link>
              </Button>
            </div>
          )}
        {/* Mobile menu panel */}
        {mounted && renderMobile && createPortal(
          <div className={cn("fixed inset-0 z-50 md:hidden", "transition-opacity duration-300", entering && !exiting ? 'opacity-100' : 'opacity-0')} role="dialog" aria-modal="true">
            <div className={cn("absolute inset-0 bg-black/40", "transition-opacity duration-300", entering && !exiting ? 'opacity-100' : 'opacity-0')} onClick={() => setMobileOpen(false)} />
            <div
              id="mobile-nav-panel"
              ref={panelRef}
              className={cn(
                "absolute right-0 top-0 h-full w-[80vw] max-w-xs bg-background p-4 shadow-lg overflow-y-auto flex flex-col",
                "transform transition-transform duration-300 will-change-transform",
                entering && !exiting ? 'translate-x-0' : 'translate-x-full'
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <Link href="/" className="font-semibold" onClick={() => setMobileOpen(false)}>Plataforma</Link>
                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1" aria-label="Menú principal">
                {NAV_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm transition-colors',
                      isActive(item.href, item.exact) ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm transition-colors',
                      isActive('/admin') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >Administración</Link>
                )}
              </nav>
              <div className="mt-4 border-t pt-4">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-center text-muted-foreground truncate" title={user.email}>{user.name}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setMobileOpen(false); handleLogout(); }}
                      disabled={loggingOut}
                      className={loggingOut ? 'pointer-events-none opacity-70' : ''}
                    >
                      {loggingOut ? 'Saliendo…' : 'Salir'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href="/autenticacion/iniciar-sesion" onClick={() => setMobileOpen(false)}>Iniciar sesión</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/autenticacion/registro" onClick={() => setMobileOpen(false)}>Registrarse</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
        </div>
      </div>
    </header>
  );
}
