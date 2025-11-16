"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarMenuButton, SidebarMenuItem } from '@/shared/ui/sidebar';
import { BookOpen } from 'lucide-react';
import { ExercisesSubList } from './exercises-sublist';

interface GuidesSidebarItemsProps { guides: { id: string; title: string }[]; activeGuideId?: string | null }

export function GuidesSidebarItems({ guides, activeGuideId }: GuidesSidebarItemsProps) {
  const pathname = usePathname();
  return (
    <>
      {guides.map(g => {
        const href = `/guias/${g.id}`;
        const guideActive = pathname.startsWith(href) || (!!activeGuideId && activeGuideId === g.id);
        return (
              <SidebarMenuItem key={g.id}>
                <SidebarMenuButton asChild isActive={guideActive} tooltip={g.title}>
                  <Link href={href} className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span className="truncate group-data-[state=collapsed]:hidden">{g.title}</span>
                  </Link>
                </SidebarMenuButton>
                {guideActive && (
                  <ExercisesSubList guideId={g.id} />
                )}
              </SidebarMenuItem>
        );
      })}
    </>
  );
}
