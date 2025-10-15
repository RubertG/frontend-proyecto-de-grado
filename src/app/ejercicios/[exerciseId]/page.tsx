import { notFound } from 'next/navigation';
import { fetchExercise } from '@/features/exercises/api/exercises-api';
import { ExerciseWorkArea } from '@/features/exercises/components/student/exercise-work-area';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ exerciseId: string }> | { exerciseId: string } }

export default async function ExerciseDetailPage({ params }: Props) {
  const resolved = await params;
  const exercise = await fetchExercise(resolved.exerciseId).catch(() => null);
  if (!exercise) return notFound();
  return <ExerciseWorkArea exercise={exercise} />;
}
