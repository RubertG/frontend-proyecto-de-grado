"use client";
import * as React from 'react';
import { useExercisesAllQuery, useUpdateExerciseMutation } from '@/features/exercises/hooks/use-exercises';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Input } from '@/shared/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import Link from 'next/link';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';

interface ExerciseAllLite {
  id: string;
  guide_id: string;
  title: string;
  type: string;
  difficulty?: string | null | undefined;
  enable_structural_validation: boolean;
  enable_llm_feedback: boolean;
  is_active?: boolean;
}

type SortField = 'title' | 'type' | 'difficulty' | 'guide_id' | 'is_active' | 'struct' | 'llm';

export function ExercisesAllDataTable() {
  const { data, isLoading, isError, refetch } = useExercisesAllQuery();
  const [search, setSearch] = React.useState('');
  const [guideFilter, setGuideFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [difficultyFilter, setDifficultyFilter] = React.useState('all');
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [sortField, setSortField] = React.useState<SortField>('title');
  const [sortDir, setSortDir] = React.useState<'asc'|'desc'>('asc');

  const exercises: ExerciseAllLite[] = React.useMemo(()=> data ?? [], [data]);
  const guides = React.useMemo(()=> Array.from(new Set(exercises.map(e => e.guide_id))).sort(), [exercises]);
  const types = React.useMemo(()=> Array.from(new Set(exercises.map(e => e.type))).sort(), [exercises]);
  const difficulties = React.useMemo(()=> Array.from(new Set(exercises.map(e => e.difficulty).filter(Boolean) as string[])).sort(), [exercises]);

  const sorted = React.useMemo(()=>{
    const arr = [...exercises];
    arr.sort((a,b)=>{
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'guide_id': return a.guide_id.localeCompare(b.guide_id) * dir;
        case 'type': return a.type.localeCompare(b.type) * dir;
        case 'difficulty': {
          const ad = a.difficulty || '';
          const bd = b.difficulty || '';
          return ad.localeCompare(bd) * dir;
        }
        case 'is_active': {
          const av = a.is_active ? 1 : 0;
          const bv = b.is_active ? 1 : 0;
          return (av - bv) * dir;
        }
        case 'struct': {
          const av = a.enable_structural_validation ? 1 : 0;
          const bv = b.enable_structural_validation ? 1 : 0;
          return (av - bv) * dir;
        }
        case 'llm': {
          const av = a.enable_llm_feedback ? 1 : 0;
          const bv = b.enable_llm_feedback ? 1 : 0;
          return (av - bv) * dir;
        }
        case 'title': 
        default: return a.title.localeCompare(b.title) * dir;
      }
    });
    return arr;
  }, [exercises, sortField, sortDir]);

  const filtered = React.useMemo(()=> sorted.filter(e => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (guideFilter !== 'all' && e.guide_id !== guideFilter) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (difficultyFilter !== 'all' && (e.difficulty || '') !== difficultyFilter) return false;
    if (activeFilter !== 'all') {
      const act = !!e.is_active;
      if (activeFilter === 'active' && !act) return false;
      if (activeFilter === 'inactive' && act) return false;
    }
    return true;
  }), [sorted, search, guideFilter, typeFilter, difficultyFilter, activeFilter]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando ejercicios…</p>;
  if (isError) return <div className="space-y-2"><p className="text-sm text-red-600">Error al cargar ejercicios.</p><Button size="sm" onClick={()=>refetch()}>Reintentar</Button></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 w-[220px] max-w-full">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Buscar</label>
          <Input placeholder="Título..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1 w-[170px]">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Guía</label>
          <Select value={guideFilter} onValueChange={setGuideFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Guía" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {guides.map(g => <SelectItem key={g} value={g}>{g.slice(0,8)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 w-[150px]">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tipo</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 w-[170px]">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dificultad</label>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Dificultad" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {difficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 w-[150px]">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Estado</label>
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
  <div className="rounded-md border bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {['title','guide_id','type','difficulty','struct','llm','is_active','actions'].map(col => {
                const headerMap: Record<string,string> = { title:'Título', guide_id:'Guía', type:'Tipo', difficulty:'Dificultad', struct:'Validación estructural', llm:'Feedback LLM', is_active:'Estado', actions:'Acciones' };
                const sortable = !['actions'].includes(col);
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
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground h-24">Sin ejercicios</TableCell>
              </TableRow>
            )}
            {filtered.map(e => (
              <TableRow key={e.id}>
                <TableCell className="max-w-[300px] truncate" title={e.title}>{e.title}</TableCell>
                <TableCell className="font-mono text-xs">{e.guide_id.slice(0,8)}</TableCell>
                <TableCell>{e.type}</TableCell>
                <TableCell>{e.difficulty || <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                <TableCell className="w-[120px]">
                  {e.enable_structural_validation ? (
                    <Badge className="text-xs">Activo</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="w-[120px]">
                  {e.enable_llm_feedback ? (
                    <Badge className="text-xs">Activo</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="w-[100px]">
                  <InlineExerciseActiveToggle exercise={e} />
                </TableCell>
                <TableCell className="w-[220px] text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" asChild><Link href={`/admin/exercises/${e.id}`}>Ver</Link></Button>
                    <Button variant="secondary" size="sm" asChild><Link href={`/admin/exercises/${e.id}/edit`}>Editar</Link></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-xs text-muted-foreground">Mostrando {filtered.length} de {exercises.length}</div>
        {(search || guideFilter !== 'all' || typeFilter !== 'all' || difficultyFilter !== 'all' || activeFilter !== 'all') && (
          <Button variant="ghost" size="sm" onClick={()=>{ setSearch(''); setGuideFilter('all'); setTypeFilter('all'); setDifficultyFilter('all'); setActiveFilter('all'); }}>Limpiar filtros</Button>
        )}
      </div>
    </div>
  );
}

interface InlineToggleProps { exercise: { id: string; guide_id: string; is_active?: boolean; } }
function InlineExerciseActiveToggle({ exercise }: InlineToggleProps) {
  const { mutate, isPending } = useUpdateExerciseMutation(exercise.id, exercise.guide_id);
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
