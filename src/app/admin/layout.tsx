import React from 'react'
import { SidebarShell } from './sidebar-shell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server Component: delega interacción al componente cliente SidebarShell
  return <SidebarShell>{children}</SidebarShell>
}
