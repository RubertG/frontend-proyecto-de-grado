import { notFound } from 'next/navigation';
import { Badge } from '@/shared/ui/badge';
import { TypeBadge, DifficultyBadge } from '@/components/badges/exercise-badges';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { fetchExercise } from '@/features/exercises/api/exercises-api';
import { ReadOnlyCode } from '@/features/exercises/components/read-only-code';

interface ExerciseDetailShape {
  id: string;
  guide_id: string;
  title: string;
  type: string;
  difficulty?: string | null;
  enable_structural_validation: boolean;
  enable_llm_feedback: boolean;
  is_active?: boolean;
  content_html?: string | null;
  expected_answer?: string | null;
  ai_context?: string | null;
  sample_solution?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export default async function ExerciseViewPage({ params }: { params: Promise<{ exerciseId: string }> }) {
  const { exerciseId } = await params;
  let exercise: ExerciseDetailShape | null = null;
  try {
    exercise = await fetchExercise(exerciseId);
  } catch {
    exercise = null;
  }
  if (!exercise) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{exercise.title}</h1>
          <div className="flex gap-2 flex-wrap text-xs">
            <Badge className="text-xs">{exercise.is_active ? 'Activo' : 'Inactivo'}</Badge>
            <Badge variant="outline">{exercise.type}</Badge>
            <div className="flex gap-2 items-center flex-wrap">
              <TypeBadge type={exercise.type} />
              <DifficultyBadge difficulty={exercise.difficulty} />
              {exercise.difficulty && <Badge variant="outline" className="hidden" />}
            </div>
            <Badge className="text-xs" variant={exercise.enable_structural_validation ? 'default' : 'secondary'}>
              Val. estructural: {exercise.enable_structural_validation ? 'Activo' : 'Inactivo'}
            </Badge>
            <Badge className="text-xs" variant={exercise.enable_llm_feedback ? 'default' : 'secondary'}>
              Feedback LLM: {exercise.enable_llm_feedback ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary"><Link href={`/admin/exercises/${exercise.id}/edit`}>Editar</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/exercises">Volver</Link></Button>
        </div>
      </div>
      <div className="space-y-6 max-w-4xl">
        {exercise.content_html && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Contenido</h2>
            <div className="prose prose-sm dark:prose-invert rich-content max-w-none" style={{ maxHeight: '480px', overflowY: 'auto' }} dangerouslySetInnerHTML={{ __html: exercise.content_html }} />
          </div>
        )}
        {exercise.ai_context && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Contexto LLM</h2>
            <ReadOnlyCode value={exercise.ai_context} language="markdown" autoHeight />
          </div>
        )}
        {exercise.expected_answer && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Respuesta esperada</h2>
            <ReadOnlyCode value={exercise.expected_answer} language={exercise.type === 'dockerfile' ? 'dockerfile' : 
                                                                     exercise.type === 'command' ? 'shell' : 
                                                                     exercise.type === 'compose' ? 'yaml' : 'plaintext'} autoHeight maxAutoHeight={480} />
          </div>
        )}
        {exercise.sample_solution && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Solución de muestra</h2>
            <ReadOnlyCode value={exercise.sample_solution} language={exercise.type === 'dockerfile' ? 'dockerfile' : 
                                                                     exercise.type === 'command' ? 'shell' : 
                                                                     exercise.type === 'compose' ? 'yaml' : 'plaintext'} autoHeight maxAutoHeight={9999} />
          </div>
        )}
      </div>
    </div>
  );
}
