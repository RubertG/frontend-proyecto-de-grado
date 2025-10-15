"use client";
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/sheet';

const navItems: { href: string; label: string }[] = [
  { href: '/admin/guides', label: 'Guías' },
  { href: '/admin/exercises', label: 'Ejercicios' },
  { href: '/admin/attempts', label: 'Intentos' },
  { href: '/admin/llm-status', label: 'LLM Status' },
  { href: '/admin/metrics', label: 'Métricas' },
];

export function AdminResponsiveNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur border-b px-4 h-14 flex items-center justify-between">
      <div className="font-semibold">Admin</div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Abrir navegación">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b text-left">
            <SheetTitle>Administración</SheetTitle>
          </SheetHeader>
          <nav className="flex-1 overflow-y-auto py-2">
            {navItems.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start rounded-none px-6 text-left font-normal', active && 'font-semibold')}
                  onClick={() => setOpen(false)}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
