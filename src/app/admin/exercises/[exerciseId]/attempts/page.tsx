export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import React from 'react';
import { fetchExercise } from '@/features/exercises/api/exercises-api';
import { notFound } from 'next/navigation';
import { AttemptsTable } from '@/features/attempts/components/attempts-table';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';

interface PageProps { params: { exerciseId: string } }

export default async function AdminExerciseAttemptsPage({ params }: PageProps) {
  const { exerciseId } = params;
  let exercise: Awaited<ReturnType<typeof fetchExercise>> | null = null;
  try {
    exercise = await fetchExercise(exerciseId);
  } catch {
    exercise = null;
  }
  if (!exercise) return notFound();
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Intentos · {exercise.title}</h1>
          <p className="text-xs text-muted-foreground">Listado global (admin) de intentos para este ejercicio. Puede filtrar por usuario.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href={`/admin/exercises/${exercise.id}`}>Volver</Link></Button>
        </div>
      </div>
      <AttemptsTable exerciseId={exercise.id} admin pageSize={10} />
    </div>
  );
}
