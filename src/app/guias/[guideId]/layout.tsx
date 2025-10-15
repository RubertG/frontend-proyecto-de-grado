import { ReactNode } from 'react';

interface Props { children: ReactNode; params: Promise<{ guideId: string }> | { guideId: string } }

// Layout passtrough: la estructura y sidebar ya la maneja el layout superior /guias/layout.tsx
export default async function GuideLayout({ children }: Props) {
  return <>{children}</>;
}
