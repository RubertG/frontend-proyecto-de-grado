"use client";
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { useLlmStatus } from '@/features/llm/hooks/use-llm-status'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

// Página cliente: muestra estado dinámico y refresca periódicamente
export default function LlmStatusPage() {
  return <LlmStatusClient />
}

function LlmStatusClient() {
  const { data, isLoading, isError, refetch, isFetching } = useLlmStatus();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Estado del LLM</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">Monitoreo de la configuración actual, modo stub, disponibilidad de API key y métricas operativas del motor LLM utilizado para feedback y chat. Refresca para obtener el estado más reciente.</p>
      </header>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>Refrescar {isFetching && '…'}</Button>
        {isLoading && <span className="text-xs text-muted-foreground">Cargando…</span>}
        {isError && <span className="text-xs text-destructive">Error al cargar estado</span>}
      </div>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          title="Modelo"
          description="Identificador del modelo activo"
          value={data?.model ?? '—'}
        />
        <StatusCard
          title="Temperatura"
          description="Creatividad de generación"
          value={data?.temperature != null ? data.temperature.toFixed(2) : '—'}
        />
        <StatusCard
          title="Stub mode"
          description="Respuestas simuladas"
          value={data?.stub_mode ? <Badge variant="secondary">Activo</Badge> : <Badge variant="outline">Inactivo</Badge>}
        />
        <StatusCard
          title="API Key"
          description="Disponibilidad de credenciales"
          value={data?.api_key_present ? <Badge>Presente</Badge> : <Badge variant="destructive">Falta</Badge>}
        />
        <StatusCard
          title="Similitud"
          description="Búsqueda semántica habilitada"
          value={data?.similarity_enabled ? <Badge>On</Badge> : <Badge variant="secondary">Off</Badge>}
        />
        <StatusCard
          title="Presupuesto Prompt"
          description="Límite chars por prompt"
          value={data?.prompt_budget_chars != null ? data.prompt_budget_chars.toLocaleString() : '—'}
        />
        <StatusCard
            title="Lazy Attempts"
            description="Intentos en cola diferida"
            value={data?.lazy_attempts != null ? data.lazy_attempts : '—'}
        />
        <StatusCard
            title="Último error Lazy"
            description="Mensaje de error reciente"
            value={<span className="text-xs break-words max-w-[240px] inline-block align-top">{data?.last_lazy_error || '—'}</span>}
        />
        <StatusCard
            title="Último proceso Lazy"
            description="Marca de tiempo"
            value={data?.last_lazy_time ? new Date(data.last_lazy_time).toLocaleString() : '—'}
        />
      </section>

      {data?.stub_mode && (
        <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-1">
          <p className="font-medium">Modo stub activo</p>
          <p className="text-muted-foreground">El sistema está respondiendo con salidas simuladas. Útil para desarrollo sin costo. Desactiva stub mode para métricas reales.</p>
        </div>
      )}

      {!isLoading && !isError && !data && (
        <div className="text-sm text-muted-foreground">No se recibió información del estado del LLM.</div>
      )}
    </div>
  )
}

function StatusCard({ title, description, value }: { title: string; description: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm font-medium flex items-center gap-2 min-h-6">{value}</div>
      </CardContent>
    </Card>
  )
}
