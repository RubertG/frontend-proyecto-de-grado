'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useGuidesQuery } from '@/features/guides/hooks/use-guides';
import { useAdminProgressOverview } from '../hooks/use-admin-progress';
import { ApiError } from '@/shared/api/http-client';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Loader } from '@/shared/ui/Loader';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { AdminProgressStatus } from '@/shared/api/schemas';

function parseNumber(value: string | null, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function statusBadge(status: AdminProgressStatus) {
  if (status === 'completed') return <Badge variant="outline">Completado</Badge>;
  if (status === 'in_progress') return <Badge>En progreso</Badge>;
  return <Badge variant="secondary">Sin iniciar</Badge>;
}

export function AdminProgressOverviewTable() {
  const [openGuides, setOpenGuides] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const guideId = searchParams.get('guideId') || '';
  const PAGE_SIZE = 10;
  const page = Math.max(parseNumber(searchParams.get('page'), 1), 1);
  const query = searchParams.get('q') || '';

  const filters = React.useMemo(
    () => ({}),
    [],
  );

  const { data, isLoading, isError, refetch, isFetching, error } = useAdminProgressOverview(filters);
  const { data: guides } = useGuidesQuery();

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
      if (!term) return true;
      return (
        item.name.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.user_id.toLowerCase().includes(term)
      );
    });
  }, [data?.items, query]);

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
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data?.summary.total_students ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Promedio de avance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {data?.summary.avg_completion_percent?.toFixed(1) ?? '—'}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Guías totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data?.summary.total_guides ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ejercicios totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data?.summary.total_exercises ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase">Guía</label>
            <Popover open={openGuides} onOpenChange={setOpenGuides}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="justify-between w-full">
                  {guideId
                    ? guides?.find((guide) => guide.id === guideId)?.title || 'Guía seleccionada'
                    : 'Todas'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[340px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar guía..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron guías</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="Todas"
                        onSelect={() => {
                          setParams({ guideId: null });
                          setOpenGuides(false);
                        }}
                      >
                        <Check className={cn('mr-2 h-4 w-4', !guideId ? 'opacity-100' : 'opacity-0')} />
                        <span>Todas</span>
                      </CommandItem>
                      {(guides ?? []).map((guide) => (
                        <CommandItem
                          key={guide.id}
                          value={`${guide.title} ${guide.topic || ''}`}
                          onSelect={() => {
                            setParams({ guideId: guide.id });
                            setOpenGuides(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              guide.id === guideId ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{guide.title}</span>
                            {guide.topic && (
                              <span className="text-xs text-muted-foreground">{guide.topic}</span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase">Buscar usuario</label>
            <Input
              placeholder="Nombre o email"
              value={query}
              onChange={(e) => setParams({ q: e.target.value || null })}
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            {isFetching ? 'Actualizando...' : 'Refrescar'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              router.replace(pathname, { scroll: false });
            }}
          >
            Limpiar filtros
          </Button>
          {guideId && (
            <Button asChild size="sm">
              <Link href={`/admin/progress/guides/${guideId}`}>Ver detalle por guía</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="rounded border bg-background/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estudiante</TableHead>
              <TableHead>Avance</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Última actividad</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  <Loader />
                </TableCell>
              </TableRow>
            )}
            {isError && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-destructive py-6">
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
                  {apiError?.status === 422 && (
                    <span>Filtros invalidos. Verifica rangos de porcentaje.</span>
                  )}
                  {apiError?.status !== 401 &&
                    apiError?.status !== 403 &&
                    apiError?.status !== 422 && <span>Error al cargar datos de progreso.</span>}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  No se encontraron resultados con los filtros actuales.
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
                    <div className="h-2 rounded bg-muted mt-2 overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(100, Math.max(0, item.percent))}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(item.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.last_activity_at
                      ? new Date(item.last_activity_at).toLocaleString('es-ES')
                      : 'Sin actividad'}
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/progress/users/${item.user_id}`}>Ver detalle</Link>
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
