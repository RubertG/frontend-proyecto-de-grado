"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarMenuButton, SidebarMenuItem } from '@/shared/ui/sidebar';
import { BookOpen } from 'lucide-react';
import { ExercisesSubList } from './exercises-sublist';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/tooltip';
import { useExerciseRuntimeStore } from '@/shared/stores/exercise-runtime-store';
interface GuidesSidebarItemsProps { guides: { id: string; title: string }[]; activeGuideId?: string | null }

export function GuidesSidebarItems({ guides, activeGuideId }: GuidesSidebarItemsProps) {
  const pathname = usePathname();
  const runtime = useExerciseRuntimeStore();
  const isLocked = !!runtime.attemptId || runtime.isSubmitting || runtime.isGeneratingFeedback;
  return (
    <>
      {guides.map(g => {
        const href = `/guias/${g.id}`;
        const guideActive = pathname.startsWith(href) || (!!activeGuideId && activeGuideId === g.id);
        return (
              <SidebarMenuItem key={g.id}>
                {isLocked ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <SidebarMenuButton asChild isActive={guideActive} aria-disabled onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); }}>
                          <Link href={href} className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 shrink-0" />
                            <span className="truncate group-data-[state=collapsed]:hidden">{g.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">Termina la conversación o pulsa &quot;Otro intento&quot;.</TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarMenuButton asChild isActive={guideActive} tooltip={g.title}>
                    <Link href={href} className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 shrink-0" />
                      <span className="truncate group-data-[state=collapsed]:hidden">{g.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
                {guideActive && (
                  <ExercisesSubList guideId={g.id} />
                )}
              </SidebarMenuItem>
        );
      })}
    </>
  );
}
