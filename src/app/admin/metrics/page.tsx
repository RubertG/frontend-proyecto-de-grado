"use client";
import React from 'react';
import { useMetricsOverviewItems } from '@/features/metrics/hooks/use-metrics-overview';
import type { MetricsOverviewItem } from '@/shared/api/schemas';
// (Se eliminaron tarjetas de KPIs y actividad reciente)
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/shared/ui/command';
import { ChevronsUpDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/shared/ui/select';

export default function MetricsPage() {
  return <MetricsClient />;
}

function MetricsClient() {
  const [userFilter, setUserFilter] = React.useState('');
  const [exerciseFilter, setExerciseFilter] = React.useState('');
  const [limit, setLimit] = React.useState(100);
  const { data: itemsData, isLoading: itemsLoading, isError: itemsError, refetch: refetchItems, isFetching: itemsFetching } = useMetricsOverviewItems({ userId: userFilter || undefined, exerciseId: exerciseFilter || undefined, limit });
  const [openUser, setOpenUser] = React.useState(false);
  const [openExercise, setOpenExercise] = React.useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const usersOptions = React.useMemo(()=> (itemsData?.items || [])
    .filter(i=> i.user?.id)
    .reduce<Record<string,{name?:string; email?:string}>>((acc,it)=> { acc[it.user!.id!] = { name: it.user!.name, email: it.user!.email }; return acc; }, {}), [itemsData]);
  const exerciseOptions = React.useMemo(()=> (itemsData?.items || [])
    .filter(i=> i.exercise?.id)
    .reduce<Record<string,{title?:string; type?:string}>>((acc,it)=> { acc[it.exercise!.id!] = { title: it.exercise!.title, type: it.exercise!.type }; return acc; }, {}), [itemsData]);

  // Paginación cliente sobre los items mostrados (tras filtro server por user/exercise/limit)
  const [pageSize, setPageSize] = React.useState(25);
  const [page, setPage] = React.useState(0);
  const pageCount = Math.ceil((itemsData?.items.length || 0) / pageSize) || 1;
  const paginatedItems = React.useMemo(()=> {
    if (!itemsData?.items) return [];
    const start = page * pageSize;
    return itemsData.items.slice(start, start + pageSize);
  }, [itemsData, page, pageSize]);
  React.useEffect(()=> { setPage(0); }, [userFilter, exerciseFilter, limit, pageSize]);

  // Prefiltro desde query params (?user= & ?exercise=)
  React.useEffect(()=> {
    const u = searchParams?.get('user');
    const ex = searchParams?.get('exercise');
    if (u && !userFilter) setUserFilter(u);
    if (ex && !exerciseFilter) setExerciseFilter(ex);
  }, [searchParams, userFilter, exerciseFilter]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Métricas</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">Registros recientes de generación LLM (feedback/chat) con métricas técnicas. Usa los filtros para acotar y exporta según sea necesario en el futuro.</p>
      </header>
      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium tracking-tight">Eventos LLM recientes</h2>
          <p className="text-xs text-muted-foreground">Registros de generación de feedback con métricas técnicas. Filtra por usuario o ejercicio. Límite configurable.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground uppercase">Usuario</label>
            <Popover open={openUser} onOpenChange={setOpenUser}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" role="combobox" className="w-56 justify-between">
                  {userFilter && usersOptions[userFilter] ? (usersOptions[userFilter].name || usersOptions[userFilter].email || short(userFilter)) : 'Seleccionar usuario'}
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar usuario..." className="text-sm" />
                  <CommandList className="max-h-60">
                    <CommandEmpty className="text-sm">Sin resultados</CommandEmpty>
                    <CommandGroup heading="Usuarios">
                      {Object.entries(usersOptions).map(([id, info]) => (
                        <CommandItem key={id} value={id} onSelect={()=>{ setUserFilter(id === userFilter ? '' : id); setOpenUser(false); refetchItems(); }} className="text-sm">
                          <span className="truncate max-w-[140px]">{info.name || info.email || short(id)}</span>
                          <span className="ml-2 text-xs text-muted-foreground font-mono">{id.slice(0,6)}…</span>
                        </CommandItem>
                      ))}
                      {Object.keys(usersOptions).length === 0 && (
                        <CommandItem disabled value="__no_users__" className="text-sm opacity-60">No hay usuarios</CommandItem>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground uppercase">Ejercicio</label>
            <Popover open={openExercise} onOpenChange={setOpenExercise}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" role="combobox" className="w-56 justify-between">
                  {exerciseFilter && exerciseOptions[exerciseFilter] ? (exerciseOptions[exerciseFilter].title || short(exerciseFilter)) : 'Seleccionar ejercicio'}
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar ejercicio..." className="text-sm" />
                  <CommandList className="max-h-60">
                    <CommandEmpty className="text-sm">Sin resultados</CommandEmpty>
                    <CommandGroup heading="Ejercicios">
                      {Object.entries(exerciseOptions).map(([id, info]) => (
                        <CommandItem key={id} value={id} onSelect={()=>{ setExerciseFilter(id === exerciseFilter ? '' : id); setOpenExercise(false); refetchItems(); }} className="text-sm">
                          <span className="truncate max-w-[140px]">{info.title || short(id)}</span>
                          <span className="ml-2 text-xs text-muted-foreground font-mono">{id.slice(0,6)}…</span>
                        </CommandItem>
                      ))}
                      {Object.keys(exerciseOptions).length === 0 && (
                        <CommandItem disabled value="__no_exercises__" className="text-sm opacity-60">No hay ejercicios</CommandItem>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground uppercase">Límite fetch</label>
            <Select value={String(limit)} onValueChange={(v)=> setLimit(Number(v))}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="Límite" />
              </SelectTrigger>
              <SelectContent>
                {[50,100,150,200].map(v=> <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground uppercase">Items por página</label>
            <Select value={String(pageSize)} onValueChange={(v)=> setPageSize(Number(v))}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                {[10,25,50,100].map(v=> <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" variant="outline" onClick={()=>{ refetchItems(); }}>{itemsFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Refrescar'}</Button>
          {(userFilter || exerciseFilter) && (
            <Button
              size="sm"
              variant="secondary"
              onClick={()=>{
                setUserFilter('');
                setExerciseFilter('');
                const sp = new URLSearchParams(searchParams?.toString());
                sp.delete('user');
                sp.delete('exercise');
                router.replace(pathname + (sp.toString()?`?${sp.toString()}`:''), { scroll: false });
                refetchItems();
              }}
            >Limpiar</Button>
          )}
        </div>
        <div className="rounded border bg-background/60 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr className="text-left">
                <th className="py-2 px-3 font-medium">ID</th>
                <th className="py-2 px-3 font-medium">Usuario</th>
                <th className="py-2 px-3 font-medium">Ejercicio</th>
                <th className="py-2 px-3 font-medium">Modelo</th>
                <th className="py-2 px-3 font-medium">Tokens</th>
                <th className="py-2 px-3 font-medium">Latencia</th>
                <th className="py-2 px-3 font-medium">Flags</th>
                <th className="py-2 px-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {itemsLoading && (
                <tr><td colSpan={8} className="py-6 text-center text-muted-foreground">Cargando…</td></tr>
              )}
              {itemsError && !itemsLoading && (
                <tr><td colSpan={8} className="py-6 text-center text-destructive">Error cargando registros</td></tr>
              )}
              {!itemsLoading && !itemsError && itemsData && itemsData.items.length === 0 && (
                <tr><td colSpan={8} className="py-6 text-center text-muted-foreground">Sin registros</td></tr>
              )}
              {paginatedItems.map((it)=> (
                <tr key={it.id} className="border-t last:border-b">
                  <td className="py-2 px-3 font-mono">
                    {it.attempt_id ? (
                      <Link className="underline underline-offset-2 hover:text-primary text-sm" href={`/admin/attempts?attempt=${it.attempt_id}`} title={it.attempt_id}>{short(it.attempt_id)}</Link>
                    ) : <span className="text-sm">—</span>}
                  </td>
                  <td className="py-2 px-3">
                    {it.user?.id ? (
                      <Link className="underline underline-offset-2 hover:text-primary text-sm" href={`${pathname}?user=${it.user.id}${exerciseFilter?`&exercise=${exerciseFilter}`:''}`} title={it.user.email || it.user.id} onClick={(e)=>{
                        e.preventDefault();
                        setUserFilter(it.user!.id!);
                        const sp = new URLSearchParams(searchParams?.toString());
                        sp.set('user', it.user!.id!);
                        if (exerciseFilter) sp.set('exercise', exerciseFilter);
                        router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
                      }}>{it.user.name || it.user.email || short(it.user.id)}</Link>
                    ) : <span className="text-sm">—</span>}
                  </td>
                  <td className="py-2 px-3">
                    {it.exercise?.id ? (
                      <Link className="underline underline-offset-2 hover:text-primary text-sm" href={`/admin/exercises/${it.exercise.id}`} title={it.exercise.title || it.exercise.id}>{it.exercise.title || short(it.exercise.id)}</Link>
                    ) : <span className="text-sm">—</span>}
                  </td>
                  <td className="py-2 px-3">
                    {it.model ? <span className="font-mono text-sm">{it.model}</span> : <span className="text-sm">—</span>}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {tokensCell(it)}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">{latencyBadge(it.latency_ms)}</td>
                  <td className="py-2 px-3">{renderFlags(it)}</td>
                  <td className="py-2 px-3 whitespace-nowrap">{it.created_at ? new Date(it.created_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {itemsData?.count != null && (
          <p className="text-xs text-muted-foreground">Mostrando {paginatedItems.length} de {itemsData.items.length} (total {itemsData.count}) · Fetch {limit} · Página {page+1}/{pageCount} · PageSize {pageSize}</p>
        )}
        {pageCount > 1 && (
          <div className="flex flex-wrap gap-2 items-center pt-2 text-xs">
            <span>Página {page+1}/{pageCount}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" disabled={page===0} onClick={()=>setPage(0)}>«</Button>
              <Button size="sm" variant="outline" disabled={page===0} onClick={()=>setPage(p=>p-1)}>‹</Button>
              {Array.from({ length: pageCount }).slice(0,6).map((_,i)=>(
                <Button key={i} size="sm" variant={i===page? 'default':'outline'} onClick={()=>setPage(i)}>{i+1}</Button>
              ))}
              {pageCount > 6 && <span className="px-1">…</span>}
              <Button size="sm" variant="outline" disabled={page>=pageCount-1} onClick={()=>setPage(p=>p+1)}>›</Button>
              <Button size="sm" variant="outline" disabled={page>=pageCount-1} onClick={()=>setPage(pageCount-1)}>»</Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}


function short(id?: string) {
  if (!id) return '—';
  return id.slice(0,8)+'…';
}

function tokensCell(it: MetricsOverviewItem) {
  if (it.prompt_tokens == null && it.completion_tokens == null) return <span className="text-sm">—</span>;
  return <span className="font-mono text-sm">{it.prompt_tokens ?? 0}/{it.completion_tokens ?? 0}</span>;
}

function renderFlags(it: MetricsOverviewItem) {
  const flags = it.quality_flags || {};
  const entries = Object.entries(flags).filter(([,v])=> v !== false && v != null);
  if (!entries.length) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([k]) => (
        <Badge key={k} variant="outline" className="text-sm px-1 py-0 leading-relaxed">{k}</Badge>
      ))}
    </div>
  );
}

function latencyBadge(latency?: number | null) {
  if (latency == null) return <span className="text-sm">—</span>;
  return <Badge variant="outline" className="font-mono text-sm">{latency.toFixed(0)}ms</Badge>;
}
