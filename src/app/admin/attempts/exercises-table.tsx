"use client";
import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import Link from 'next/link';
import { Input } from '@/shared/ui/input';

interface ExerciseRow {
  id: string;
  title: string;
  guide_id: string;
  type: string;
  difficulty?: string | null;
  enable_structural_validation: boolean;
  enable_llm_feedback: boolean;
  is_active?: boolean; // algunos registros podrían venir sin este campo definido
}

interface Props {
  exercises: ExerciseRow[];
}

export function ExercisesAttemptsTable({ exercises }: Props) {
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q)
    );
  }, [exercises, query]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Total: {exercises.length}</span>
          <span className="hidden sm:inline">|</span>
          <span>Mostrando: {filtered.length}</span>
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Filtrar por título o tipo..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>
      <div className="rounded border bg-background/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ejercicio</TableHead>
              <TableHead>Guía</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Dificultad</TableHead>
              <TableHead>Val. Struct</TableHead>
              <TableHead>Feedback LLM</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground text-sm">Sin resultados</TableCell>
              </TableRow>
            )}
            {filtered.map(ex => (
              <TableRow key={ex.id} data-state={!ex.is_active ? 'inactive' : undefined}>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm leading-tight">{ex.title}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{ex.id.slice(0, 8)}…</span>
                  </div>
                </TableCell>
                <TableCell className="text-[11px] font-mono truncate max-w-[140px]" title={ex.guide_id}>{ex.guide_id.slice(0,8)}…</TableCell>
                <TableCell className="text-sm">{ex.type}</TableCell>
                <TableCell className="text-sm">{ex.difficulty || '-'}</TableCell>
                <TableCell className="text-sm">{ex.enable_structural_validation ? 'Sí':'No'}</TableCell>
                <TableCell className="text-sm">{ex.enable_llm_feedback ? 'Sí':'No'}</TableCell>
                <TableCell className="text-sm">
                  <Badge variant={ex.is_active ? 'default' : 'secondary'}>{ex.is_active ? 'Activo' : 'Inactivo'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/exercises/${ex.id}/attempts`}>Ver intentos</Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/exercises/${ex.id}`}>Detalle</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
