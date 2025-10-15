import React from 'react';
import type { ProgressOverviewTotals } from '@/shared/api/schemas';

interface Props {
  totals: ProgressOverviewTotals;
}

export const ProgressOverviewBar: React.FC<Props> = ({ totals }) => {
  const percent = totals.percent_exercises ?? (totals.total_exercises ? (totals.completed_exercises / totals.total_exercises) * 100 : 0);
  const pctRounded = Math.round(percent * 100) / 100;
  return (
    <div className="rounded-md border p-4 bg-white dark:bg-neutral-900 space-y-3">
      <div className="flex flex-wrap gap-4 items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold">Progreso global</h2>
          <p className="text-sm text-muted-foreground">{totals.completed_exercises}/{totals.total_exercises} ejercicios • {totals.completed_guides}/{totals.total_guides} guías</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold">{pctRounded.toFixed(2)}%</span>
        </div>
      </div>
      <div className="h-3 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
    </div>
  );
};
