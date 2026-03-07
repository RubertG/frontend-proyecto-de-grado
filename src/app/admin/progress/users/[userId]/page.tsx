import { AdminProgressUserDetail } from '@/features/admin-progress/components/admin-progress-user-detail';

interface AdminProgressUserPageProps {
  params: Promise<{ userId: string }>;
}

export default async function AdminProgressUserPage({ params }: AdminProgressUserPageProps) {
  const { userId } = await params;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Detalle de progreso de usuario</h1>
        <p className="text-sm text-muted-foreground">
          Vista completa del avance del estudiante por guía y ejercicios.
        </p>
      </header>
      <AdminProgressUserDetail userId={userId} />
    </div>
  );
}
