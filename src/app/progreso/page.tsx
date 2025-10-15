"use client";
import React from 'react';
import { useProgressOverview } from '@/features/progress/hooks/use-progress';
import { ProgressOverviewBar } from '@/features/progress/components/progress-overview-bar';
import { GuideProgressCard } from '@/features/progress/components/guide-progress-card';

// Nota: Página cliente para aprovechar React Query (datos dependen del usuario autenticado)
// Si se prefiere server component + RSC fetch habría que exponer un fetch server-friendly con token cookie.
export default function ProgresoPage() {
  // Incluimos ejercicios = false (no detallado) para carga rápida
  const { data, isLoading, isError, error, refetch } = useProgressOverview();

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Progreso</h1>
        <p className="text-sm text-muted-foreground">Resumen de tu avance en las guías y ejercicios.</p>
      </header>
      {isLoading && (
        <div className="animate-pulse space-y-4">
          <div className="h-24 rounded-md bg-neutral-200 dark:bg-neutral-800" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_,i) => <div key={i} className="h-32 rounded-lg bg-neutral-200 dark:bg-neutral-800" />)}
          </div>
        </div>
      )}
      {isError && (
        <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-900/30 p-4 text-sm">
          <p className="font-medium mb-1">Error al cargar progreso</p>
          <p className="mb-2">{(error as Error)?.message || 'Intenta nuevamente.'}</p>
          <button onClick={() => refetch()} className="text-xs underline">Reintentar</button>
        </div>
      )}
      {data && (
        <>
          <ProgressOverviewBar totals={data.totals} />
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Guías</h2>
            {data.guides.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay guías disponibles.</p>}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.guides.map(g => <GuideProgressCard key={g.guide_id} guide={g} />)}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
