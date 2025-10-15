import { Suspense } from 'react';
import { fetchGuides } from '@/features/guides/api/guides-api';
// import { GuideListSchema } from '@/shared/api/schemas'; // reservado futuras validaciones adicionales
import Link from 'next/link';
import React from 'react';

export const dynamic = 'force-dynamic';

async function GuidesList() {
  const guides = await fetchGuides();
  const ordered = [...guides].sort((a,b) => a.order - b.order);

  // Paleta suave para topics (cíclica si no hay mapeo específico)
  const topicPalette = [
    'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200',
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
    'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200',
    'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
    'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200'
  ];
  function topicClass(topic?: string | null) {
    if (!topic) return 'bg-muted text-muted-foreground';
    // simple hash
    const h = Array.from(topic).reduce((acc,c)=>acc + c.charCodeAt(0),0);
    const sel = topicPalette[h % topicPalette.length];
    return sel;
  }

  return (
    <div className="grid gap-6 md:gap-7 sm:grid-cols-2 xl:grid-cols-3">
      {ordered.map((g) => {
        return (
          <Link
            key={g.id}
            href={`/guias/${g.id}`}
            prefetch={false}
            className="group relative rounded-2xl border border-border/70 bg-gradient-to-br from-background/70 via-background/60 to-background/40 backdrop-blur supports-[backdrop-filter]:bg-background/50 p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all overflow-hidden ring-1 ring-transparent hover:ring-primary/10"
          >
            {/* Glow suave */}
            <div className="pointer-events-none absolute inset-px rounded-[1.05rem] opacity-0 group-hover:opacity-100 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 blur-sm transition-opacity" />
            <div className="flex items-start gap-3 relative z-[1]">
              <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors shadow-inner">
                {g.title.slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <h3 className="font-semibold tracking-tight text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">{g.title}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {g.topic && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${topicClass(g.topic)}`}>{g.topic}</span>
                  )}
                  {!g.is_active && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">Borrador</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-auto relative z-[1] flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/50 group-hover:bg-primary/80 transition-colors" />
                Orden <strong className="font-medium text-foreground ml-0.5">{g.order}</strong>
              </span>
              <span className="opacity-70 group-hover:opacity-100 transition-opacity font-medium">Ver detalles →</span>
            </div>
            {/* Borde interior dinámico */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-border/50 group-hover:ring-primary/30" />
          </Link>
        );
      })}
    </div>
  );
}

export default async function GuidesPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Guías</h1>
        <p className="text-sm text-muted-foreground max-w-prose">Explora las guías disponibles y avanza de forma estructurada. Esta vista mostrará tu progreso global en próximas iteraciones.</p>
      </header>
      <Suspense fallback={<GuidesSkeleton />}> <GuidesList /> </Suspense>
    </div>
  );
}

function GuidesSkeleton() {
  return (
    <div className="grid gap-6 md:gap-7 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_,i)=>(
        <div key={i} className="relative rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 p-5 flex flex-col gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted/70" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3 w-3/4 rounded bg-muted/60" />
              <div className="h-3 w-1/2 rounded bg-muted/50" />
              <div className="flex gap-2 mt-1">
                <div className="h-4 w-14 rounded-full bg-muted/50" />
                <div className="h-4 w-10 rounded-full bg-muted/40" />
              </div>
            </div>
          </div>
          <div className="mt-auto flex items-center justify-between gap-4 pt-2">
            <div className="h-3 w-24 rounded bg-muted/40" />
            <div className="h-3 w-20 rounded bg-muted/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

