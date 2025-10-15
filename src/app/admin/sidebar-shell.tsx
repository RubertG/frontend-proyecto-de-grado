"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { adminNavItems } from '@/config/admin-navigation'
import { useSessionStore } from '@/shared/stores/session-store'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/query-keys'
import type { Guide } from '@/shared/api/schemas'
import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/shared/ui/dropdown-menu'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/shared/ui/breadcrumb'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
  SidebarRail,
  SidebarFooter
} from '@/shared/ui/sidebar'

export function SidebarShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logOut } = useSessionStore()
  const router = useRouter()

  // genera breadcrumbs a partir del pathname /admin/... evitando ids dinamicos específicos
  const segments = pathname.split('/').filter(Boolean) // remove empty
  const breadcrumbSegments = segments.slice(1) // remove 'admin'
  const qc = useQueryClient()
  const isGuideEdit = /\/admin\/guides\/[0-9a-fA-F-\-]{8,}\/edit$/.test(pathname)
  let guideTitle: string | undefined
  if (isGuideEdit) {
    const parts = pathname.split('/')
    const guideId = parts[parts.indexOf('guides') + 1]
  const cached = qc.getQueryData<Guide>(queryKeys.guideDetail(guideId))
  if (cached?.title) guideTitle = cached.title
    else guideTitle = guideId ? guideId.slice(0,7) : undefined
  }

  const breadcrumbItems = breadcrumbSegments.map((seg, idx, arr) => {
    const href = '/admin/' + arr.slice(0, idx + 1).join('/')
    const isLast = idx === arr.length - 1
    const isDynamic = /\[|\]|^[0-9a-fA-F-]{8,}$/.test(seg)
    let label = seg

    // Segmento 'edit' siempre se muestra como 'Editar'
    if (seg === 'edit') {
      label = 'Editar'
    } else if (isGuideEdit && seg !== 'edit' && isDynamic && guideTitle) {
      // ID de la guía: usar título si disponible
      label = guideTitle
    } else if (isDynamic) {
      if (pathname.includes('/create')) label = 'Crear'
      else if (!isLast && seg !== 'edit') label = 'Detalle'
    }

    if (label === seg) {
      // Normalizar sólo si no lo reemplazamos ya por frases tipo Editar / Crear / Detalle / título
      label = label.replace(/-/g, ' ')
      label = label.charAt(0).toUpperCase() + label.slice(1)
    }
    return { href, label, isLast }
  })

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <Sidebar collapsible="icon" variant="sidebar">
          <SidebarContent>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <SidebarTrigger />
              <span className="font-semibold text-sm">Admin</span>
            </div>
          </SidebarHeader>
            <SidebarGroup>
              <SidebarGroupLabel>Navegación</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavItems.map(item => {
                    const active = pathname.startsWith(item.href)
                    const Icon = item.icon
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                          <Link href={item.href} className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-2 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 px-2 text-sm">
                  <UserIcon className="h-4 w-4" />
                  <span className="truncate">{user?.name || user?.email || 'Usuario'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Sesión</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logOut()
                    try { router.push('/autenticacion/iniciar-sesion') } catch {}
                  }}
                  className="gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
          <SidebarSeparator />
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="min-w-0 flex-1">
          <div className="flex flex-col flex-1 w-full min-w-0">
            <header className="flex h-12 items-center gap-2 border-b px-4">
              <SidebarTrigger className="md:hidden" />
              <div className="flex-1 overflow-hidden">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/admin">Admin</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {breadcrumbItems.map(item => (
                      <React.Fragment key={item.href}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          {item.isLast ? (
                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link href={item.href}>{item.label}</Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <main className="flex-1 flex flex-col items-stretch min-w-0">
              <div className="w-full max-w-full admin-page-body px-4 md:px-6 py-4 md:py-6 min-w-0">
                {children}
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
