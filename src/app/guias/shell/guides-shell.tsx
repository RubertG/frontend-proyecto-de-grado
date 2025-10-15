"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSessionStore } from '@/shared/stores/session-store';
import { useQueryClient } from '@tanstack/react-query';
import { StudentTopNav } from '@/components/student/navigation/student-top-nav';
import { toast } from 'sonner';
import { LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { supabaseBrowser } from '@/shared/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/shared/ui/breadcrumb';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarHeader, SidebarInset, SidebarTrigger, SidebarFooter, SidebarRail, SidebarSeparator } from '@/shared/ui/sidebar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/shared/ui/dropdown-menu';
import { GuidesSidebarItems } from '../guides-sidebar-items';

interface GuidesShellProps { guides: { id: string; title: string; order: number; is_active?: boolean | null; topic?: string | null }[]; children: React.ReactNode; activeGuideId?: string | null }

export function GuidesShell({ guides, children, activeGuideId: activeGuideIdProp }: GuidesShellProps) {
  const pathname = usePathname();
  const { user, logOut } = useSessionStore();
  const qc = useQueryClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const [derivedGuideId, setDerivedGuideId] = useState<string | null>(activeGuideIdProp ?? null);
  const [exerciseTitle, setExerciseTitle] = useState<string | null>(null);


  // Derivar guideId cuando estamos en /ejercicios/[exerciseId]
  React.useEffect(() => {
    if (activeGuideIdProp) { setDerivedGuideId(activeGuideIdProp); }
    if (!pathname.startsWith('/ejercicios/')) return;
    const parts = pathname.split('/');
    const exerciseId = parts[2];
    if (!exerciseId || exerciseId.length < 10) return;
    import('@/features/exercises/api/exercises-api').then(m => {
      m.fetchExercise(exerciseId).then(ex => {
        if (ex?.guide_id) setDerivedGuideId(ex.guide_id);
        if (ex?.title) setExerciseTitle(ex.title);
      }).catch(() => {});
    });
  }, [pathname, activeGuideIdProp]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await supabaseBrowser.auth.signOut();
      try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
      qc.clear();
      logOut();
      try { router.refresh(); } catch {}
      toast.success('Sesión cerrada');
    } catch {
      toast.error('Error cerrando sesión');
    } finally {
      setLoggingOut(false);
    }
  }

  // Breadcrumbs (Inicio / Guías / [Guía])
  const breadcrumb: { href?: string; label: string; current?: boolean }[] = [];
  breadcrumb.push({ href: '/', label: 'Inicio' });
  breadcrumb.push({ href: '/guias', label: 'Guías', current: pathname === '/guias' });
  if (pathname.startsWith('/guias/') && pathname !== '/guias') {
    const guideId = pathname.split('/')[2];
    const guide = guides.find(g => g.id === guideId);
    breadcrumb.push({ href: `/guias/${guideId}`, label: guide?.title || 'Guía', current: true });
  } else if (pathname.startsWith('/ejercicios/')) {
    if (derivedGuideId) {
      const guide = guides.find(g => g.id === derivedGuideId);
      if (guide) breadcrumb.push({ href: `/guias/${guide.id}`, label: guide.title });
    }
    breadcrumb.push({ label: exerciseTitle || 'Ejercicio', current: true });
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col w-full min-h-screen">
        <div className="flex flex-1 min-h-0">
          <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <SidebarTrigger />
                <span className="font-semibold text-sm group-data-[collapsible=icon]:hidden">Guías</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Listado</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <GuidesSidebarItems guides={guides} activeGuideId={derivedGuideId ?? undefined} />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-2 border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 px-2 text-sm">
                    <UserIcon className="h-4 w-4" />
                    {/** Usar 'Usuario' como fallback estable para evitar mismatch de SSR -> CSR; span con suppressHydrationWarning para permitir actualización tras montar */}
                    <span className="truncate group-data-[collapsible=icon]:hidden" suppressHydrationWarning>{user?.name || user?.email || 'Usuario'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="w-56">
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Sesión</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                      <Link href="/admin" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Administración</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user ? (
                    <DropdownMenuItem
                      onClick={(e) => { e.preventDefault(); handleLogout(); }}
                      disabled={loggingOut}
                      className="gap-2 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{loggingOut ? 'Saliendo…' : 'Cerrar sesión'}</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                      <Link href="/autenticacion/iniciar-sesion" className="flex items-center gap-2">
                        <span>Iniciar sesión</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarFooter>
            <SidebarSeparator />
            <SidebarRail />
          </Sidebar>
          <SidebarInset className="flex-1 flex flex-col min-w-0">
            <StudentTopNav />
            {/* Breadcrumb con más respiro respecto a la top nav y el contenido */}
            <header className="flex items-center gap-2 px-4 md:px-6 py-2 mt-1 mb-4 md:mb-5">
              <SidebarTrigger className="md:hidden" />
              <div className="flex-1 overflow-hidden">
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumb.map((b, i) => {
                      const isLast = i === breadcrumb.length - 1;
                      return (
                        <React.Fragment key={i}>
                          {i > 0 && <BreadcrumbSeparator />}
                          <BreadcrumbItem>
                            {isLast || b.current ? (
                              <BreadcrumbPage>{b.label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild><Link href={b.href || '#'}>{b.label}</Link></BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </React.Fragment>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <main className="flex-1 min-w-0 px-4 md:px-6 pb-6 pt-0">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
