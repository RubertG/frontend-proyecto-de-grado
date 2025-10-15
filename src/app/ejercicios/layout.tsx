import { ReactNode } from 'react';
import { fetchGuides } from '@/features/guides/api/guides-api';
import { GuidesShell } from '@/app/guias/shell/guides-shell';

export const dynamic = 'force-dynamic';

export default async function ExercisesSectionLayout({ children }: { children: ReactNode }) {
  // Reutilizamos misma carga de guías que la sección /guias para mantener sidebar sincronizado
  const guides = await fetchGuides().catch(() => []);
  const ordered = [...guides].sort((a,b) => a.order - b.order);
  return <GuidesShell guides={ordered}>{children}</GuidesShell>;
}
