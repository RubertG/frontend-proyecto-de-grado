"use client";
import * as React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useExercisesByGuideQuery, useDeleteExerciseMutation, useUpdateExerciseMutation } from '@/features/exercises/hooks/use-exercises';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Input } from '@/shared/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import Link from 'next/link';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';


type SortField = 'title' | 'type' | 'difficulty';

interface Props { guideId: string }

export function ExercisesDataTable({ guideId }: Props) {
  const { data, isLoading, isError, refetch } = useExercisesByGuideQuery(guideId || '');
  const deleteMutation = useDeleteExerciseMutation(guideId || '');

  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [difficultyFilter, setDifficultyFilter] = React.useState('all');
  const [sortField, setSortField] = React.useState<SortField>('title');
  const [sortDir, setSortDir] = React.useState<'asc'|'desc'>('asc');

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const exercises = React.useMemo(()=> data ?? [], [data]);
  const types = React.useMemo(()=> Array.from(new Set(exercises.map(e => e.type))).sort(), [exercises]);
  const difficulties = React.useMemo(()=> Array.from(new Set(exercises.map(e => e.difficulty).filter(Boolean) as string[])).sort(), [exercises]);

  const sorted = React.useMemo(()=>{
    const arr = [...exercises];
    arr.sort((a,b)=>{
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'type': return a.type.localeCompare(b.type) * dir;
        case 'difficulty': {
          const ad = a.difficulty || '';
          const bd = b.difficulty || '';
          return ad.localeCompare(bd) * dir;
        }
        case 'title':
        default: return a.title.localeCompare(b.title) * dir;
      }
    });
    return arr;
  }, [exercises, sortField, sortDir]);

  const filtered = React.useMemo(()=> sorted.filter(e => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (difficultyFilter !== 'all' && (e.difficulty || '') !== difficultyFilter) return false;
    return true;
  }), [sorted, search, typeFilter, difficultyFilter]);

  if (!guideId) {
    return <p className="text-sm text-muted-foreground">Ingresa un Guide ID arriba para listar ejercicios.</p>;
  }
  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando ejercicios…</p>;
  if (isError) return <div className="space-y-2"><p className="text-sm text-red-600">Error al cargar ejercicios.</p><Button size="sm" onClick={()=>refetch()}>Reintentar</Button></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 w-[220px] max-w-full">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Buscar</label>
          <Input placeholder="Título..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1 w-[160px]">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tipo</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 w-[200px]">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dificultad</label>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Dificultad" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {difficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
  <div className="rounded-md border bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {['title','type','difficulty','is_active','actions'].map(col => {
                const headerMap: Record<string,string> = { title:'Título', type:'Tipo', difficulty:'Dificultad', is_active:'Estado', actions:'Acciones' };
                const sortable = col !== 'actions';
                const isActive = sortField === col;
                const icon = !sortable ? null : isActive ? (sortDir === 'asc' ? <ArrowUp className="size-3"/> : <ArrowDown className="size-3"/>) : <ArrowUpDown className="size-3 opacity-50"/>;
                return (
                  <TableHead
                    key={col}
                    onClick={() => {
                      if (!sortable) return;
                      if (sortField === col) {
                        setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField(col as SortField); setSortDir('asc');
                      }
                    }}
                    className={cn(sortable && 'cursor-pointer select-none')}
                  >
                    <span className="inline-flex items-center gap-1">{headerMap[col]} {icon}</span>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground h-24">Sin ejercicios</TableCell>
              </TableRow>
            )}
            {filtered.map(e => (
              <TableRow key={e.id}>
                <TableCell className="max-w-[320px] truncate" title={e.title}>{e.title}</TableCell>
                <TableCell>{e.type}</TableCell>
                <TableCell>{e.difficulty || <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                <TableCell className="w-[100px]">
                  <InlineExerciseActiveToggle exercise={e} guideId={guideId} />
                </TableCell>
                <TableCell className="w-[230px] text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" asChild><Link href={`/admin/exercises/${e.id}`}>Ver</Link></Button>
                    <Button variant="secondary" size="sm" asChild><Link href={`/admin/exercises/${e.id}/edit`}>Editar</Link></Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(e.id, { onSuccess: () => toast.success('Ejercicio eliminado'), onError: () => toast.error('Error al eliminar') })}
                    >
                      {deleteMutation.isPending && <span className="animate-spin size-4 border-2 border-current border-t-transparent rounded-full" />}
                      Borrar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-xs text-muted-foreground">Mostrando {filtered.length} de {exercises.length}</div>
        {(search || typeFilter !== 'all' || difficultyFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={()=>{
              setSearch('');
              setTypeFilter('all');
              setDifficultyFilter('all');
              const sp = new URLSearchParams(searchParams?.toString());
              // Limpiamos parámetros relacionados si existieran
              ['search','type','difficulty'].forEach(p=> sp.delete(p));
              router.replace(pathname + (sp.toString()?`?${sp.toString()}`:''), { scroll:false });
            }}
          >Limpiar filtros</Button>
        )}
      </div>
    </div>
  );
}

interface InlineToggleProps { exercise: { id: string; is_active?: boolean }; guideId: string }
function InlineExerciseActiveToggle({ exercise, guideId }: InlineToggleProps) {
  const { mutate, isPending } = useUpdateExerciseMutation(exercise.id, guideId);
  const active = !!exercise.is_active;
  return (
    <button
      type="button"
      onClick={() => { if (!isPending) mutate({ is_active: !active }); }}
      className={cn(
        "rounded-md border h-7 px-2 text-[11px] font-medium inline-flex items-center justify-center gap-1 transition-colors min-w-[68px] max-w-[78px]",
        active ? "bg-green-600/15 text-green-700 dark:text-green-400 border-green-600/30 hover:bg-green-600/25" : "bg-gray-500/10 text-muted-foreground border-gray-500/30 hover:bg-gray-500/20"
      )}
      aria-pressed={active}
      aria-label={active ? 'Desactivar ejercicio' : 'Activar ejercicio'}
      disabled={isPending}
    >
      {isPending && <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {active ? 'Activo' : 'Inactivo'}
    </button>
  );
}
