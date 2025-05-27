'use client';

import { DemoProvider } from '@/contexts/DemoContext';

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoProvider>
      {children}
    </DemoProvider>
  );
} 