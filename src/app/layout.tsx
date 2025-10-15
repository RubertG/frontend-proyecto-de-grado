import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from '@/shared/providers/app-providers';
import Link from 'next/link';
import { LayoutContainer } from '../components/layout/layout-container';

// Layout ahora es un Server Component; la lógica cliente vive en AppProviders.
export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plataforma Educativa de Docker",
  description: "Plataforma para aprender las bases de Docker.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>        
        <AppProviders>
          {/* Barra superior global estudiante (excluye áreas admin que tienen su propio shell) */}
          <LayoutContainer>
            {children}
          </LayoutContainer>
        </AppProviders>
      </body>
    </html>
  );
}
