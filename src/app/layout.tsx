'use client';

import { DemoProvider } from '@/contexts/DemoContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        <DemoProvider>
          {children}
        </DemoProvider>
      </body>
    </html>
  );
} 