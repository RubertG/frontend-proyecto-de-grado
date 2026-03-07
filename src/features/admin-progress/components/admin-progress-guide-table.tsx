'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAdminProgressByGuide } from '../hooks/use-admin-progress';
import { ApiError } from '@/shared/api/http-client';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Loader } from '@/shared/ui/Loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import type { AdminProgressStatus } from '@/shared/api/schemas';

interface AdminProgressGuideTableProps {
  guideId: string;
}

function parseNumber(value: string | null, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function statusBadge(status: AdminProgressStatus) {
  if (status === 'completed') return <Badge variant="outline">Completado</Badge>;
  if (status === 'in_progress') return <Badge>En progreso</Badge>;
  return <Badge variant="secondary">Sin iniciar</Badge>;
}

export function AdminProgressGuideTable({ guideId }: AdminProgressGuideTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = (searchParams.get('status') || '') as '' | AdminProgressStatus;
  const minPercentRaw = parseNumber(searchParams.get('minPercent'), 0);
  const maxPercentRaw = parseNumber(searchParams.get('maxPercent'), 100);
  const minPercent = clamp(minPercentRaw, 0, 100);
  const maxPercent = Math.max(minPercent, clamp(maxPercentRaw, 0, 100));
  const PAGE_SIZE = 10;
  const page = Math.max(parseNumber(searchParams.get('page'), 1), 1);
  const query = searchParams.get('q') || '';

  const filters = React.useMemo(
    () => ({}),
    [],
  );

  const { data, isLoading, isError, refetch, isFetching, error } = useAdminProgressByGuide(
    guideId,
    filters,
  );

  const setParams = React.useCallback(
    (patches: Record<string, string | number | null>) => {
      const sp = new URLSearchParams(searchParams.toString());
      Object.entries(patches).forEach(([key, value]) => {
        if (value === null || value === '') sp.delete(key);
        else sp.set(key, String(value));
      });
      if (patches.page === undefined) {
        sp.set('page', '1');
      }
      router.replace(`${pathname}${sp.toString() ? `?${sp.toString()}` : ''}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const filteredItems = React.useMemo(() => {
    const items = data?.items ?? [];
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      if (status && item.status !== status) return false;
      if (item.percent < minPercent || item.percent > maxPercent) return false;
      if (!term) return true;
      return (
        item.name.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.user_id.toLowerCase().includes(term)
      );
    });
  }, [data?.items, query, status, minPercent, maxPercent]);

  const totalCount = filteredItems.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paginatedItems = React.useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, safePage]);
  const apiError = error instanceof ApiError ? error : null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{data?.guide.title ?? 'Guía'}</h2>
          <p className="text-sm text-muted-foreground">
            Orden {data?.guide.order ?? '-'} · Ejercicios: {data?.guide.total_exercises ?? '-'}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Estudiantes</p>
            <p className="text-2xl font-semibold">{data?.summary.students_total ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Completaron</p>
            <p className="text-2xl font-semibold">{data?.summary.students_completed ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Tasa de completitud</p>
            <p className="text-2xl font-semibold">{data?.summary.completion_percent?.toFixed(1) ?? '—'}%</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase">Estado</label>
            <Select value={status || 'all'} onValueChange={(v) => setParams({ status: v === 'all' ? null : v })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="not_started">Sin iniciar</SelectItem>
                <SelectItem value="in_progress">En progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase">% Mínimo</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={String(minPercent)}
              onChange={(e) => setParams({ minPercent: e.target.value || 0 })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase">% Máximo</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={String(maxPercent)}
              onChange={(e) => setParams({ maxPercent: e.target.value || 100 })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase">Buscar usuario</label>
            <Input placeholder="Nombre o email" value={query} onChange={(e) => setParams({ q: e.target.value || null })} />
          </div>
          <div className="flex items-end gap-2">
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              {isFetching ? 'Actualizando...' : 'Refrescar'}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => router.replace(pathname, { scroll: false })}>
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded border bg-background/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estudiante</TableHead>
              <TableHead>Avance en guía</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Completado</TableHead>
              <TableHead>Última actividad</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <Loader />
                </TableCell>
              </TableRow>
            )}
            {isError && !isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive py-6">
                  {apiError?.status === 401 && (
                    <div className="space-y-2">
                      <p>Sesion expirada. Inicia sesion nuevamente.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push('/autenticacion/iniciar-sesion')}
                      >
                        Ir a login
                      </Button>
                    </div>
                  )}
                  {apiError?.status === 403 && (
                    <span>No tienes permisos de administrador para esta vista.</span>
                  )}
                  {apiError?.status === 404 && <span>La guia no existe o no esta disponible.</span>}
                  {apiError?.status === 422 && (
                    <span>Filtros invalidos. Verifica rangos de porcentaje.</span>
                  )}
                  {apiError?.status !== 401 &&
                    apiError?.status !== 403 &&
                    apiError?.status !== 404 &&
                    apiError?.status !== 422 && <span>Error al cargar datos por guia.</span>}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                  No se encontraron estudiantes para esta guía.
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              !isError &&
              paginatedItems.map((item) => (
                <TableRow key={item.user_id}>
                  <TableCell>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.email}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {item.completed_exercises}/{item.total_exercises} ({item.percent.toFixed(1)}%)
                    </p>
                  </TableCell>
                  <TableCell>{statusBadge(item.status)}</TableCell>
                  <TableCell>
                    {item.completed ? <Badge variant="outline">Sí</Badge> : <Badge variant="secondary">No</Badge>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.last_activity_at ? new Date(item.last_activity_at).toLocaleString('es-ES') : 'Sin actividad'}
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/progress/users/${item.user_id}`}>Ver usuario</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap text-sm text-muted-foreground">
        <span>
          Página {safePage} de {pageCount} · Total: {totalCount} · Mostrando {paginatedItems.length}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={safePage <= 1}
            onClick={() => setParams({ page: safePage - 1 })}
          >
            Anterior
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={safePage >= pageCount}
            onClick={() => setParams({ page: safePage + 1 })}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
