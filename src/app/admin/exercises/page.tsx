"use client";
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { ExercisesAllDataTable } from '@/features/exercises/components/exercises-all-data-table';

export default function AdminExercisesListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold tracking-tight">Ejercicios</h1>
        <Button asChild><Link href="/admin/exercises/create">Nuevo Ejercicio</Link></Button>
      </div>
      <ExercisesAllDataTable />
    </div>
  );
}
