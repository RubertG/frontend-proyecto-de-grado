import { fetchGuide } from '@/features/guides/api/guides-api';
import { fetchExercisesWithProgress, fetchExercisesByGuide } from '@/features/exercises/api/exercises-api';
import { TypeBadge, DifficultyBadge } from '@/components/badges/exercise-badges';
import { Exercise } from '@/shared/api/schemas';
import { SafeHtml } from '@/components/safe-html';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ guideId: string }> | { guideId: string } }

export default async function GuideDetailPage({ params }: Props) {
  const resolved = await params; // soporta tanto sincrónico como promesa (Next 15 dynamic)
  const guide = await fetchGuide(resolved.guideId).catch(() => null);
  if (!guide) return notFound();
  type ExerciseWithProgress = { id: string; title: string; type: string; difficulty?: string | null; is_active?: boolean; completed: boolean; attempts_count: number };
  let exercises: ExerciseWithProgress[] = await fetchExercisesWithProgress(resolved.guideId).catch(() => [] as ExerciseWithProgress[]);
  // Fallback: si la respuesta viene vacía pero el endpoint legacy tiene datos (p.e. backend no añadió progreso todavía)
  if (exercises.length === 0) {
    const legacy = await fetchExercisesByGuide(resolved.guideId).catch(() => [] as Pick<Exercise,'id'|'title'|'type'|'difficulty'|'is_active'>[]);
    if (legacy && legacy.length > 0) {
      exercises = legacy.map(e => ({ ...e, completed: false, attempts_count: 0 }));
    }
  }
  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      <article className="prose dark:prose-invert max-w-none">
        <h1 className="text-2xl font-bold mb-6">{guide.title}</h1>
        {guide.topic && <p className="mt-0 text-sm text-muted-foreground">Tema: {guide.topic}</p>}
        {guide.content_html ? (
          <SafeHtml html={guide.content_html} className="rich-content prose prose-sm md:prose-base max-w-none" />
        ) : (
          <p className="text-sm text-muted-foreground">Esta guía aún no tiene contenido detallado.</p>
        )}
      </article>
  {exercises.length > 0 && (
  <section className="space-y-4" aria-labelledby="ejercicios-heading">
        <div className="flex items-center gap-3">
          <h2 id="ejercicios-heading" className="text-base font-semibold tracking-tight">Ejercicios de la guía</h2>
          {exercises.length > 0 && (
            <div className="text-xs text-muted-foreground font-medium">
              {exercises.filter(e => e.completed).length} / {exercises.length} completados
            </div>
          )}
        </div>
        <ol className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-3 list-none pl-0">
            {exercises.map((ex, idx) => {
              const completed = ex.completed;
              const delay = idx * 40; // ms
              return (
                <li
                  key={ex.id}
                  style={{ animationDelay: `${delay}ms` }}
                  className="group relative rounded-2xl border border-border/70 bg-gradient-to-br from-background/70 via-background/60 to-background/40 backdrop-blur supports-[backdrop-filter]:bg-background/50 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all overflow-hidden ring-1 ring-transparent hover:ring-primary/10 motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-1"
                >
                  {/* Glow overlay similar a las cards de guías */}
                  <div className="pointer-events-none absolute inset-px rounded-[1.05rem] opacity-0 group-hover:opacity-100 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 blur-sm transition-opacity" />
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 h-5 w-5 flex items-center justify-center rounded-full text-[10px] font-semibold border ${completed ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-muted text-muted-foreground border-border group-hover:bg-primary/10'}`}>{idx+1}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium leading-tight truncate" title={ex.title}>{ex.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <TypeBadge type={ex.type} size="xs" />
                        <DifficultyBadge difficulty={ex.difficulty} size="xs" />
                        {completed && <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">✔ Completado</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <a href={`/ejercicios/${ex.id}`} className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                      Ir al ejercicio
                    </a>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      {ex.attempts_count} intento{ex.attempts_count === 1 ? '' : 's'}
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-primary/20 pointer-events-none"/>
                </li>
              );
            })}
          </ol>
      </section>
      )}
    </div>
  );
}
