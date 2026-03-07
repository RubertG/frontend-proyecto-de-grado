import { AdminProgressGuideTable } from '@/features/admin-progress/components/admin-progress-guide-table';

interface AdminProgressGuidePageProps {
  params: Promise<{ guideId: string }>;
}

export default async function AdminProgressGuidePage({ params }: AdminProgressGuidePageProps) {
  const { guideId } = await params;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Progreso por guía</h1>
        <p className="text-sm text-muted-foreground">
          Seguimiento de estudiantes para una guía específica.
        </p>
      </header>
      <AdminProgressGuideTable guideId={guideId} />
    </div>
  );
}
