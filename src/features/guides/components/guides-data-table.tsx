"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useGuidesQuery } from "@/features/guides/hooks/use-guides";
import { type Guide } from "@/shared/api/schemas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { DeleteGuideButton } from "@/app/admin/guides/delete-guide-button";
import { Input } from "@/shared/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/shared/ui/select";
import { useUpdateGuideMutation } from "@/features/guides/hooks/use-guides";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface ColumnConfig {
  id: string;
  header: string;
  className?: string;
  render: (g: Guide) => React.ReactNode;
}

type SortField = 'title' | 'order' | 'topic' | 'is_active';

const baseColumns: ColumnConfig[] = [
  {
    id: "title",
    header: "Título",
    className: "w-[320px]",
    render: (g) => (
      <div className="flex flex-col">
        <span className="font-medium truncate" title={g.title}>{g.title}</span>
        <span className="text-xs text-muted-foreground">ID: {g.id.slice(0,8)}</span>
      </div>
    )
  },
  {
    id: "topic",
    header: "Tema",
    render: (g) => g.topic ? <Badge variant="outline">{g.topic}</Badge> : <span className="text-muted-foreground text-xs">—</span>
  },
  {
    id: "order",
    header: "Orden",
    render: (g) => <span className="font-mono text-xs">{g.order}</span>
  },
  {
    id: "is_active",
    header: "Estado",
    className: "w-[110px]",
    render: (g) => <InlineActiveToggle guide={g} />
  },
  {
    id: "actions",
    header: "Acciones",
    className: "w-[210px] text-right",
    render: (g) => (
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" asChild className="min-w-[54px]"><Link href={`/admin/guides/${g.id}`}>Ver</Link></Button>
        <Button variant="secondary" size="sm" asChild className="min-w-[62px]"><Link href={`/admin/guides/${g.id}/edit`}>Editar</Link></Button>
        <DeleteGuideButton id={g.id} />
      </div>
    )
  }
];

export function GuidesDataTable() {
  const { data, isLoading, isError, refetch } = useGuidesQuery();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");
  const [topic, setTopic] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<SortField>('order');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const guides = React.useMemo(() => data ?? [], [data]);
  const topics = React.useMemo(() => {
    const s = new Set<string>();
    guides.forEach(g => { if (g.topic) s.add(g.topic); });
    return Array.from(s).sort();
  }, [guides]);

  const sorted = React.useMemo(() => {
    const arr = [...guides];
    arr.sort((a,b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'title':
          return a.title.localeCompare(b.title) * dir;
        case 'topic': {
          const at = a.topic || '';
          const bt = b.topic || '';
          return at.localeCompare(bt) * dir;
        }
        case 'is_active': {
          const av = (a.is_active ? 1 : 0);
            const bv = (b.is_active ? 1 : 0);
          return (av - bv) * dir;
        }
        case 'order':
        default:
          return (a.order - b.order) * dir;
      }
    });
    return arr;
  }, [guides, sortField, sortDir]);

  const filtered = React.useMemo(() => sorted.filter(g => {
    if (search && !g.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (status !== 'all') {
      const active = g.is_active ?? false;
      if (status === 'active' && !active) return false;
      if (status === 'inactive' && active) return false;
    }
    if (topic !== 'all') {
      if ((g.topic || '') !== topic) return false;
    }
    return true;
  }), [sorted, search, status, topic]);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando guías…</div>;
  }
  if (isError) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-red-600">Error al cargar guías.</p>
        <Button size="sm" onClick={() => refetch()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 w-[220px] max-w-full">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Buscar</label>
          <Input placeholder="Título..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1 w-[160px]">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Estado</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activas</SelectItem>
              <SelectItem value="inactive">Inactivas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 w-[200px]">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tema</label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Tema" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
  <div className="rounded-md border bg-background overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {baseColumns.map(col => {
              const sortable = col.id !== 'actions';
              const isActive = sortField === col.id;
              const icon = !sortable ? null : isActive ? (sortDir === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ArrowUpDown className="size-3 opacity-50" />;
              return (
                <TableHead
                  key={col.id}
                  onClick={() => {
                    if (!sortable) return;
                    if (sortField === col.id) {
                      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField(col.id as SortField);
                      setSortDir('asc');
                    }
                  }}
                  className={cn(col.className, sortable && 'cursor-pointer select-none group')}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {icon}
                  </span>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={baseColumns.length} className="text-center text-sm text-muted-foreground h-24">Sin guías</TableCell>
            </TableRow>
          )}
          {filtered.map(g => (
            <TableRow key={g.id} data-state={!g.is_active ? "inactive" : undefined}>
              {baseColumns.map(col => (
                <TableCell key={col.id} className={col.id === 'title' ? 'max-w-[320px]' : undefined}>{col.render(g)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-xs text-muted-foreground">Mostrando {filtered.length} de {guides.length}</div>
        {(search || status !== 'all' || topic !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={()=> {
              setSearch("");
              setStatus("all");
              setTopic("all");
              const sp = new URLSearchParams(searchParams?.toString());
              ['search','status','topic'].forEach(p=> sp.delete(p));
              router.replace(pathname + (sp.toString()?`?${sp.toString()}`:''), { scroll:false });
            }}
          >Limpiar filtros</Button>
        )}
      </div>
    </div>
  );
}

interface ToggleProps { guide: Guide }
function InlineActiveToggle({ guide }: ToggleProps) {
  const { mutate, isPending } = useUpdateGuideMutation(guide.id);
  const active = !!guide.is_active;
  return (
    <button
      type="button"
      onClick={() => { if (!isPending) mutate({ is_active: !active }); }}
      className={cn(
        "rounded-md border h-7 px-2 text-[11px] font-medium inline-flex items-center justify-center gap-1 transition-colors min-w-[68px] max-w-[78px]",
        active ? "bg-green-600/15 text-green-700 dark:text-green-400 border-green-600/30 hover:bg-green-600/25" : "bg-gray-500/10 text-muted-foreground border-gray-500/30 hover:bg-gray-500/20"
      )}
      aria-pressed={active}
      aria-label={active ? 'Desactivar guía' : 'Activar guía'}
      disabled={isPending}
    >
      {isPending && <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {active ? 'Activa' : 'Inactiva'}
    </button>
  );
}
