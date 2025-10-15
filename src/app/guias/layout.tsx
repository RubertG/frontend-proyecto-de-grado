import { ReactNode } from 'react';
import { fetchGuides } from '@/features/guides/api/guides-api';
import { GuidesShell } from '@/app/guias/shell/guides-shell';

export const dynamic = 'force-dynamic';

export default async function GuidesSectionLayout({ children }: { children: ReactNode }) {
  const guides = await fetchGuides().catch(() => []);
  const ordered = [...guides].sort((a,b) => a.order - b.order);
  return <GuidesShell guides={ordered}>{children}</GuidesShell>;
}
