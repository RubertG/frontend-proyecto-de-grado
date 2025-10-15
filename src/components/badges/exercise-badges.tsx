"use client";
import React from 'react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';

// Mapeo de estilos de fondo/texto conservando los colores originales
const TYPE_STYLE: Record<string,string> = {
  command: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200',
  dockerfile: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
  conceptual: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200'
};

const DIFFICULTY_STYLE = {
  easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
  hard: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200',
  default: 'bg-muted text-muted-foreground'
};

interface CommonProps { className?: string; size?: 'sm' | 'xs' }

export const TypeBadge: React.FC<{ type?: string | null } & CommonProps> = ({ type, className, size='sm' }) => {
  if (!type) return null;
  const key = type.toLowerCase();
  const colorClasses = TYPE_STYLE[key] || 'bg-muted text-muted-foreground';
  const sizing = size === 'xs' ? 'px-1.5 h-5 text-[9px]' : 'px-2 h-5 text-[10px]';
  // Usamos variant="secondary" para heredar layout base y sobreescribimos colores.
  return (
    <Badge
      variant="secondary"
      className={cn(
        'uppercase tracking-wide font-medium rounded-full border-0 shadow-none',
        colorClasses,
        sizing,
        className
      )}
    >
      {type}
    </Badge>
  );
};

export const DifficultyBadge: React.FC<{ difficulty?: string | null } & CommonProps> = ({ difficulty, className, size='sm' }) => {
  if (!difficulty) return null;
  const raw = difficulty.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
  let styleKey: keyof typeof DIFFICULTY_STYLE = 'default';
  if (raw.startsWith('facil') || raw === 'easy') styleKey = 'easy';
  else if (raw.startsWith('med') || raw === 'medium') styleKey = 'medium';
  else if (raw.startsWith('dific') || raw === 'hard') styleKey = 'hard';
  const colorClasses = DIFFICULTY_STYLE[styleKey];
  const sizing = size === 'xs' ? 'px-1.5 h-5 text-[9px]' : 'px-2 h-5 text-[10px]';
  return (
    <Badge
      variant="secondary"
      className={cn(
        'capitalize font-medium rounded-full border-0 shadow-none',
        colorClasses,
        sizing,
        className
      )}
    >
      {difficulty}
    </Badge>
  );
};
