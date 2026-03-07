import { AdminProgressOverviewTable } from '@/features/admin-progress/components/admin-progress-overview-table';

export default function AdminProgressPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Progreso de usuarios</h1>
        <p className="text-sm text-muted-foreground">
          Vista general de avance por estudiante, con filtros por guía, usuario, estado y rango de porcentaje.
        </p>
      </header>
      <AdminProgressOverviewTable />
    </div>
  );
}
