'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAdminProgressByUser } from '../hooks/use-admin-progress';
import { ApiError } from '@/shared/api/http-client';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Loader } from '@/shared/ui/Loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import type { AdminProgressStatus } from '@/shared/api/schemas';

interface AdminProgressUserDetailProps {
  userId: string;
}

function statusBadge(status: AdminProgressStatus) {
  if (status === 'completed') return <Badge variant="outline">Completado</Badge>;
  if (status === 'in_progress') return <Badge>En progreso</Badge>;
  return <Badge variant="secondary">Sin iniciar</Badge>;
}

function deriveStatus(guide: {
  status?: AdminProgressStatus;
  completed?: boolean;
  completed_exercises: number;
  total_exercises: number;
}): AdminProgressStatus {
  if (guide.status) return guide.status;
  if (guide.completed) return 'completed';
  if (guide.total_exercises > 0 && guide.completed_exercises >= guide.total_exercises) {
    return 'completed';
  }
  if (guide.completed_exercises > 0) return 'in_progress';
  return 'not_started';
}

export function AdminProgressUserDetail({ userId }: AdminProgressUserDetailProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const includeExercises = searchParams.get('includeExercises') !== 'false';

  const { data, isLoading, isError, refetch, isFetching, error } = useAdminProgressByUser(
    userId,
    includeExercises,
  );
  const apiError = error instanceof ApiError ? error : null;

  const setIncludeExercises = (value: boolean) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) sp.delete('includeExercises');
    else sp.set('includeExercises', 'false');
    router.replace(`${pathname}${sp.toString() ? `?${sp.toString()}` : ''}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{data?.user.name ?? 'Detalle de usuario'}</h2>
          <p className="text-sm text-muted-foreground">{data?.user.email ?? ''}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select
            value={includeExercises ? 'with-exercises' : 'basic'}
            onValueChange={(v) => setIncludeExercises(v === 'with-exercises')}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Modo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="with-exercises">Detalle con ejercicios</SelectItem>
              <SelectItem value="basic">Solo resumen por guía</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            {isFetching ? 'Actualizando...' : 'Refrescar'}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Guías completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data?.totals.completed_guides ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Guías totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data?.totals.total_guides ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ejercicios completados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data?.totals.completed_exercises ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ejercicios totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data?.totals.total_exercises ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avance global</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data?.totals.percent_exercises?.toFixed(1) ?? '—'}%</p>
          </CardContent>
        </Card>
      </div>

      {isLoading && (
        <div className="rounded border py-10">
          <Loader />
        </div>
      )}
      {isError && !isLoading && (
        <div className="rounded border border-destructive/40 p-4 text-sm text-destructive">
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
          {apiError?.status === 404 && <span>El usuario no existe o no esta disponible.</span>}
          {apiError?.status !== 401 &&
            apiError?.status !== 403 &&
            apiError?.status !== 404 && <span>Error al cargar el detalle del usuario.</span>}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-4">
          {(data?.guides ?? []).map((guide) => (
            <Card key={guide.guide_id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle>{guide.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {guide.completed_exercises}/{guide.total_exercises} ({(guide.percent ?? 0).toFixed(1)}%)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(deriveStatus(guide))}
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/progress/guides/${guide.guide_id}`}>Ver guía</Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {includeExercises && guide.exercises && guide.exercises.length > 0 && (
                <CardContent className="space-y-2 pt-0">
                  {guide.exercises.map((exercise) => (
                    <div
                      key={exercise.exercise_id}
                      className="flex items-center justify-between gap-3 rounded border px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-sm">{exercise.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Intentos: {exercise.attempts_count ?? 0}
                        </p>
                      </div>
                      {exercise.completed ? (
                        <Badge variant="outline">Completado</Badge>
                      ) : (
                        <Badge variant="secondary">Pendiente</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
          {(data?.guides.length ?? 0) === 0 && (
            <div className="rounded border p-4 text-sm text-muted-foreground">
              Este usuario no tiene progreso registrado por ahora.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
