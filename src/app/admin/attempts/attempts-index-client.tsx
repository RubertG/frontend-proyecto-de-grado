"use client";
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useExercisesAllQuery } from '@/features/exercises/hooks/use-exercises';
import { ExercisesAttemptsTable } from './exercises-table';

type ExerciseLite = {
  id: string;
  title: string;
  guide_id: string;
  type: string;
  difficulty?: string | null;
  enable_structural_validation: boolean;
  enable_llm_feedback: boolean;
  is_active?: boolean;
};
import { Button } from '@/shared/ui/button';

export function AttemptsIndexClient() {
  const { data, isLoading, isError, error, refetch } = useExercisesAllQuery();
  const exercises: ExerciseLite[] = Array.isArray(data) ? data : [];
  const search = useSearchParams();
  const attemptIdParam = search?.get('attempt');
  // Si viene attempt en query, encontrar ejercicio y redirigir a su página de intentos con ancla (delega a esa vista para selección)
  React.useEffect(()=> {
    if (!attemptIdParam) return;
    // No tenemos mapping directo attempt->exercise aquí; se asume usuario navegará luego.
    // Podemos mostrar un aviso mínimo (opcional)
  }, [attemptIdParam]);

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="text-xs text-muted-foreground">Cargando ejercicios…</div>
      )}
      {isError && (
        <div className="rounded border border-destructive/50 bg-destructive/10 text-destructive p-3 text-xs space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium">Error cargando ejercicios</p>
            <Button size="sm" variant="outline" onClick={()=>refetch()} className="h-6 px-2 text-[11px]">Reintentar</Button>
          </div>
          <p>{error instanceof Error ? error.message : 'Error desconocido'}</p>
          <p className="text-[10px] opacity-70 leading-snug">Este fetch ocurre en el cliente usando la sesión de Supabase. Si persiste el 401 revisa que la sesión esté activa y que el dominio de la cookie coincida, o reautentica al usuario.</p>
        </div>
      )}
      {!isLoading && !isError && (
        <ExercisesAttemptsTable exercises={exercises} />
      )}
      {attemptIdParam && (
        <p className="text-[11px] text-muted-foreground">Parametro attempt recibido: {attemptIdParam.slice(0,8)}… ve al ejercicio correspondiente para ver el detalle.</p>
      )}
    </div>
  );
}
