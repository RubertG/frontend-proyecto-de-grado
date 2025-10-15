import React from 'react';
import type { ProgressOverviewGuide } from '@/shared/api/schemas';
import Link from 'next/link';

interface Props {
  guide: ProgressOverviewGuide;
}

export const GuideProgressCard: React.FC<Props> = ({ guide }) => {
  const percent = guide.percent ?? (guide.total_exercises ? (guide.completed_exercises / guide.total_exercises) * 100 : 0);
  const pctRounded = Math.round(percent * 100) / 100;
  return (
    <div className="rounded-lg border bg-white dark:bg-neutral-900 p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{guide.title}</h3>
          <p className="text-xs text-muted-foreground">{guide.completed_exercises}/{guide.total_exercises} ejercicios</p>
        </div>
        {guide.completed && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-100 font-medium">Completada</span>
        )}
      </div>
      <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{pctRounded.toFixed(1)}%</span>
        <Link href={`/guias/${guide.guide_id}`} className="underline underline-offset-2 hover:text-blue-600 dark:hover:text-blue-400">Ir a la guía</Link>
      </div>
    </div>
  );
};
