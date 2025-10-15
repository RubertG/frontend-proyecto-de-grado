import { fetchExercise } from '@/features/exercises/api/exercises-api';
import { notFound } from 'next/navigation';
import { AttemptsTable } from '@/features/attempts/components/attempts-table';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';

export default async function AttemptsByExercisePage({ params }: { params: Promise<{ exerciseId: string }> }) {
  const { exerciseId } = await params;
  let exercise: Awaited<ReturnType<typeof fetchExercise>> | null = null;
  try { exercise = await fetchExercise(exerciseId); } catch { exercise = null; }
  if (!exercise) return notFound();
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Intentos · {exercise.title}</h1>
          <p className="text-xs text-muted-foreground">Ver y filtrar intentos de este ejercicio</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href={`/admin/exercises/${exercise.id}`}>Volver</Link></Button>
        </div>
      </div>
      <AttemptsTable exerciseId={exercise.id} />
    </div>
  );
}
