import React from 'react'
import Link from 'next/link'
import { adminNavItems } from '@/config/admin-navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

// Dashboard administrativo general
export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Panel administrativo</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">Resumen centralizado y acceso rápido a todas las secciones de gestión: guías, ejercicios, intentos, estado del LLM y métricas. Selecciona una sección para profundizar.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {adminNavItems.map(item => {
          const Icon = item.icon
          return (
            <Card key={item.href} className="group flex flex-col">
              <CardHeader className="pb-2 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    {item.label}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  {(() => {
                    switch(item.href) {
                      case '/admin/guides': return 'Organiza y administra las guías de contenido.'
                      case '/admin/exercises': return 'Gestiona ejercicios, estados y configuraciones.'
                      case '/admin/attempts': return 'Explora los intentos de los estudiantes.'
                      case '/admin/llm-status': return 'Monitorea el estado y configuración del motor LLM.'
                      case '/admin/metrics': return 'Consulta métricas y analíticas agregadas.'
                      default: return 'Ir a la sección.'
                    }
                  })()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="text-xs text-muted-foreground min-h-12">
                  {item.href === '/admin/attempts' && 'Últimos intentos, validaciones y feedback.'}
                  {item.href === '/admin/exercises' && 'Total de ejercicios activos y configuración.'}
                  {item.href === '/admin/guides' && 'Estructura de aprendizaje y progresión.'}
                  {item.href === '/admin/llm-status' && 'Estado de integración y límites.'}
                  {item.href === '/admin/metrics' && 'Evolución del uso y desempeño.'}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button asChild size="sm" className="w-full" variant="outline">
                  <Link href={item.href}>Entrar</Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
