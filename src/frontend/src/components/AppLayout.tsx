import { ReactNode } from 'react';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import { useManualAuth } from '../hooks/useManualAuth';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { role } = useManualAuth();
  
  return (
    <div className={`flex min-h-screen flex-col role-${role}`}>
      <AppHeader />
      <main className="flex-1">{children}</main>
      <AppFooter />
    </div>
  );
}
