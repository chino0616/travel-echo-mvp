'use client';

import { DemoProvider } from '@/contexts/DemoContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <DemoProvider>{children}</DemoProvider>;
} 