"use client";
import { usePathname } from 'next/navigation';
import React from 'react';
import { StudentTopNav } from '@/components/student/navigation/student-top-nav';
import Link from 'next/link';

export function LayoutContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Secciones con layout propio: /guias y /admin
  if (pathname.startsWith('/guias') || pathname.startsWith('/admin') || pathname.startsWith('/ejercicios')) {
    return <>{children}</>;
  }
  return (
    <div className="flex-1 w-full mx-auto max-w-screen-2xl px-4 pb-6 pt-0 grid grid-rows-[auto_1fr_auto]">
      <StudentTopNav />
      <div className="pt-0">{children}</div>
        <footer className="w-full border-t pt-5 mt-10 text-xs text-center text-muted-foreground">
            Plataforma Educativa construida por Rubert Gonzalez · <Link href="/autenticacion/iniciar-sesion" className="underline hover:no-underline">Iniciar sesión</Link>
        </footer>
    </div>
  );
}
