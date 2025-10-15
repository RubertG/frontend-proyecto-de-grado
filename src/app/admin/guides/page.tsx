import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { GuidesDataTable } from '@/features/guides/components/guides-data-table';

export const dynamic = 'force-dynamic';

export default function AdminGuidesListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold tracking-tight">Guías</h1>
        <Button asChild>
          <Link href="/admin/guides/create">Nueva Guía</Link>
        </Button>
      </div>
      <GuidesDataTable />
    </div>
  );
}

