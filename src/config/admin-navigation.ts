import { BookOpenText, Dumbbell, History, Cpu, BarChart3 } from "lucide-react"

export type AdminNavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin/guides", label: "Guías", icon: BookOpenText },
  { href: "/admin/exercises", label: "Ejercicios", icon: Dumbbell },
  { href: "/admin/attempts", label: "Intentos", icon: History },
  { href: "/admin/llm-status", label: "LLM Status", icon: Cpu },
  { href: "/admin/metrics", label: "Métricas", icon: BarChart3 },
]
