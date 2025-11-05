"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useExercisesWithProgressQuery, useExercisesByGuideQuery } from '@/features/exercises/hooks/use-exercises';
import { useSessionStore } from '@/shared/stores/session-store';
import { SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/shared/ui/sidebar';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface ExercisesSubListProps { guideId: string }

// Nota: Actualmente disparamos 1 query por ejercicio para attempts. Para optimizar se podría
// introducir un endpoint agregado (progress/by-guide) o extender exercises endpoint con flag completed.
// Dado el tamaño inicial esperado, mantenemos este enfoque simple y dejamos TODO de optimización.
export function ExercisesSubList({ guideId }: ExercisesSubListProps) {
  const pathname = usePathname();
  const user = useSessionStore(s => s.user);
  // Si hay usuario usamos endpoint con progreso; si no, el legacy sin progreso.
  const userId = user?.id;
  const { data: exercisesWithProgress, isLoading: loadingWithProgress, refetch: refetchWithProgress, isFetching: fetchingWithProgress } = useExercisesWithProgressQuery(guideId, userId);
  const { data: exercisesLegacy, isLoading: loadingLegacy } = useExercisesByGuideQuery(guideId);
  // Si hay usuario pero todavía no se habilita la query (userId null en primer render), tratamos como loading.
  const loadingExercises = user ? (loadingWithProgress || (!exercisesWithProgress && fetchingWithProgress)) : loadingLegacy;
  const exercises = user
    ? exercisesWithProgress
    : (exercisesLegacy?.map(e => ({ ...e, completed: false, attempts_count: 0 })) as { id:string; title:string; completed: boolean; attempts_count:number }[] | undefined);

  // Refetch al aparecer el userId (primera carga post login/client hydration)
  React.useEffect(() => {
    if (userId) {
      refetchWithProgress();
    }
  }, [userId, refetchWithProgress]);

  if (loadingExercises) {
    return (
      <SidebarMenuSub>
        <SidebarMenuSubItem>
          <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Cargando ejercicios…
          </div>
        </SidebarMenuSubItem>
      </SidebarMenuSub>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <SidebarMenuSub>
        <SidebarMenuSubItem>
          <div className="px-2 py-1 text-xs text-muted-foreground">Sin ejercicios aún</div>
        </SidebarMenuSubItem>
      </SidebarMenuSub>
    );
  }

  return (
    <SidebarMenuSub>
      {exercises.map(ex => (
        <ExerciseSubItem key={ex.id} exerciseId={ex.id} title={ex.title} activePath={pathname} completed={!!ex.completed} />
      ))}
    </SidebarMenuSub>
  );
}

interface ExerciseSubItemProps { exerciseId: string; title: string; activePath: string; completed: boolean; }

function ExerciseSubItem({ exerciseId, title, activePath, completed }: ExerciseSubItemProps) {
  // Un ejercicio se considera activo si estamos en /ejercicios/[exerciseId]
  const isActive = activePath === `/ejercicios/${exerciseId}`;
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={isActive} size="sm" className="pr-2">
        <Link href={`/ejercicios/${exerciseId}`} className="flex items-center gap-2">
          {completed ? (
            <CheckCircle2 className="h-3 w-3 text-emerald-500 stroke-[2.25]" />
          ) : (
            <Circle className="h-3 w-3 text-muted-foreground" />
          )}
          <span className="truncate">{title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
