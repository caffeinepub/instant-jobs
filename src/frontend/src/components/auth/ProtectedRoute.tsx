import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useManualAuth } from '../../hooks/useManualAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import type { UserRole } from '../../auth/manualAuthTypes';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: UserRole | UserRole[];
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoading } = useManualAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const hasAccess = isAuthenticated && allowedRoles.includes(role);

  if (!hasAccess) {
    return (
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
            <h2 className="mb-2 text-2xl font-bold">Access Denied</h2>
            <p className="mb-6 text-muted-foreground">
              You need to be logged in with the appropriate role to access this page.
            </p>
            <Button onClick={() => navigate({ to: '/login' })}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
