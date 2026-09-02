import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-page">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-5 pb-6 pt-1">{children}</main>
      </div>
    </div>
  );
}
