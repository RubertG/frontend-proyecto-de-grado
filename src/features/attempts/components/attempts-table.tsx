"use client";
import React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAttemptsByExercise } from '../hooks/use-attempts';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { ReadOnlyCode } from '@/features/exercises/components/read-only-code';
import { useQueryClient } from '@tanstack/react-query';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/shared/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/shared/ui/command';
import { ChevronsUpDown, Loader2 } from 'lucide-react';
import { Loader } from '@/shared/ui/Loader';

interface AttemptsTableProps { exerciseId: string; }

export function AttemptsTable({ exerciseId }: AttemptsTableProps) {
  const [userFilter, setUserFilter] = React.useState('');
  const [openUser, setOpenUser] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: rawData, isLoading, refetch, isError } = useAttemptsByExercise(exerciseId, userFilter);
  
  // Ordenar por created_at
  const data = React.useMemo(() => {
    if (!rawData) return rawData;
    return [...rawData].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortDir === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [rawData, sortDir]);
  
  useQueryClient(); // por si luego necesitamos invalidaciones específicas
  const selected = data?.find(a => a.id === selectedId);
  const PAGE_SIZE = 20;
  const [page, setPage] = React.useState(0);
  const total = data?.length || 0;
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const paginated = React.useMemo(()=> {
    if (!data) return [];
    const start = page * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  React.useEffect(()=> {
    // Si cambia el filtro de usuario reiniciamos página
    setPage(0);
  }, [userFilter]);

  // Auto-seleccionar attempt si viene en query param ?attempt=
  React.useEffect(()=> {
    const attemptQ = search?.get('attempt');
    if (attemptQ && data && data.some(a=>a.id === attemptQ)) {
      setSelectedId(attemptQ);
    }
  }, [search, data]);

  // Actualizar query param al abrir/cerrar detalle
  const toggleSelect = (id: string, active: boolean) => {
    if (active) {
      setSelectedId(null);
      const sp = new URLSearchParams(search?.toString());
      sp.delete('attempt');
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    } else {
      setSelectedId(id);
      const sp = new URLSearchParams(search?.toString());
      sp.set('attempt', id);
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    }
  };

  // Lógica de generación de feedback eliminada según solicitud

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Filtrar por usuario</label>
          <Popover open={openUser} onOpenChange={setOpenUser}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openUser}
                className="justify-between"
              >
                {(() => {
                  if (!userFilter) return 'Seleccionar usuario';
                  const found = data?.find(a=>a.user?.id === userFilter);
                  if (found?.user) return found.user.name || found.user.email || found.user.id;
                  return userFilter;
                })()}
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar usuario..." className="text-sm" />
                <CommandList className="max-h-56">
                  <CommandEmpty className="text-sm">Sin resultados</CommandEmpty>
                  <CommandGroup heading="Usuarios">
                    {Array.from(new Map(
                      (data||[])
                        .filter(a=>a.user?.id)
                        .map(a=>[a.user!.id, {name: a.user!.name, email: a.user!.email}])
                    ).entries()).length === 0 && (
                      <CommandItem disabled value="__no_users__" className="text-sm opacity-60">No hay usuarios</CommandItem>
                    )}
                    {Array.from(new Map(
                      (data||[])
                        .filter(a=>a.user?.id)
                        .map(a=>[a.user!.id, {name: a.user!.name, email: a.user!.email}])
                    ).entries()).map(([uid, info]) => (
                      <CommandItem
                        key={uid}
                        value={uid}
                        className="text-sm"
                        onSelect={() => {
                          setUserFilter(uid);
                          setOpenUser(false);
                          refetch();
                        }}
                      >
                        <span className="truncate max-w-[140px]">{info.name || info.email}</span>
                        <span className="ml-2 text-sm text-muted-foreground font-mono">{uid.slice(0,6)}…</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
  <Button
    variant="secondary"
    size="sm"
    onClick={()=>{ setUserFilter(''); const sp = new URLSearchParams(search?.toString()); sp.delete('user'); sp.delete('attempt'); router.replace(pathname + (sp.toString()?`?${sp.toString()}`:''), { scroll:false }); refetch(); }}
  >Limpiar</Button>
      </div>
      <div className="rounded border bg-background/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Intento</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>
                <button 
                  onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Fecha de creación
                  <span className="text-xs">{sortDir === 'desc' ? '↓' : '↑'}</span>
                </button>
              </TableHead>
              <TableHead>Validación</TableHead>
              <TableHead>Completado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6"><Loader /></TableCell></TableRow>
            )}
            {isError && !isLoading && (
              <TableRow><TableCell colSpan={6} className="text-center text-destructive py-6 text-sm">Error cargando intentos</TableCell></TableRow>
            )}
            {!isLoading && !isError && data && data.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Sin intentos aún</TableCell></TableRow>
            )}
            {paginated.map(a => {
              const struct = a.structural_validation_passed;
              const active = selectedId === a.id;
              return (
                <TableRow key={a.id} data-state={active? 'selected': undefined} className={active ? 'bg-accent/40' : undefined}>
                  <TableCell className="font-mono text-xs truncate" title={a.id}>{a.id}</TableCell>
                  <TableCell className="text-sm truncate" title={a.user?.email || a.user?.id}>{a.user?.name || a.user?.email || '—'} {a.user?.id && <p className="font-mono text-xs opacity-60">{a.user.id}</p>}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {a.created_at ? new Date(a.created_at).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    {struct == null ? (
                      <Badge variant="outline">No evaluado</Badge>
                    ) : struct ? (
                      <Badge>Aprobado</Badge>
                    ) : (
                      <Badge variant="destructive">Falló</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {a.completed ? <Badge variant="outline">Sí</Badge> : <Badge variant="secondary">No</Badge>}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={()=> toggleSelect(a.id, active)}>{active? 'Cerrar':'Ver'}</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {pageCount > 1 && (
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Página {page + 1} de {pageCount}</span>
            <span>{total} intento{total===1?'':'s'} totales · Mostrando {paginated.length} (máx {PAGE_SIZE})</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="outline" disabled={page===0} onClick={()=>setPage(0)}>« Primera</Button>
            <Button size="sm" variant="outline" disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))}>‹ Anterior</Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: pageCount }).slice(0,6).map((_,i)=> (
                <Button key={i} size="sm" variant={i===page? 'default':'outline'} onClick={()=>setPage(i)}>{i+1}</Button>
              ))}
              {pageCount > 6 && <span className="text-[11px] px-1">…</span>}
            </div>
            <Button size="sm" variant="outline" disabled={page>=pageCount-1} onClick={()=>setPage(p=>Math.min(pageCount-1,p+1))}>Siguiente ›</Button>
            <Button size="sm" variant="outline" disabled={page>=pageCount-1} onClick={()=>setPage(pageCount-1)}>Última »</Button>
          </div>
        </div>
      )}
      {selected && (
        <div className="rounded border p-4 space-y-4 bg-background/60">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold text-sm">Detalle Attempt</h3>
            <Button size="sm" variant="ghost" onClick={()=>setSelectedId(null)}>Cerrar</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Respuesta enviada</p>
              <ReadOnlyCode value={selected.submitted_answer || ''} language="plaintext" autoHeight maxAutoHeight={420} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Feedback LLM</p>
              {selected.llm_feedback ? (
                <div className="prose prose-xs dark:prose-invert rich-content max-w-none whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{ __html: selected.llm_feedback }} />
              ) : (
                <p className="text-sm text-muted-foreground">Sin feedback</p>
              )}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Validación estructural</p>
              <ul className="list-disc ml-5 text-sm space-y-1">
                {selected.structural_validation_errors?.map((e,i)=>(<li key={i} className="text-destructive">{e}</li>))}
                {selected.structural_validation_warnings?.map((w,i)=>(<li key={i} className="text-amber-600 dark:text-amber-400">{w}</li>))}
                {!selected.structural_validation_errors?.length && !selected.structural_validation_warnings?.length && <li className="text-muted-foreground">Sin mensajes</li>}
              </ul>
            </div>
            {/* <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Estado</p>
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <Badge variant={selected.structural_validation_passed? 'default':'destructive'}>Validación {selected.structural_validation_passed? 'Aprobada':'Falló'}</Badge>
                <Badge variant={selected.llm_feedback? 'default':'secondary'}>Feedback {selected.llm_feedback? 'Sí':'No'}</Badge>
                <Badge variant={selected.completed? 'default':'secondary'}>Completado {selected.completed? 'Sí':'No'}</Badge>
              </div>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}
