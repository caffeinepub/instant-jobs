import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useManualAuth } from '../../hooks/useManualAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { UserRole } from '../../auth/manualAuthTypes';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: UserRole | UserRole[];
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoading: authLoading, hasCompletedProfile } = useManualAuth();
  const navigate = useNavigate();

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const hasRoleAccess = isAuthenticated && allowedRoles.includes(role);

  if (authLoading) {
    return (
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasRoleAccess) {
    return (
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
            <h2 className="mb-2 text-2xl font-bold">Access Denied</h2>
            <p className="mb-6 text-muted-foreground">
              {isAuthenticated
                ? 'You do not have permission to access this page.'
                : 'You need to be logged in to access this page.'}
            </p>
            <Button onClick={() => navigate({ to: '/login' })}>
              {isAuthenticated ? 'Go Back' : 'Go to Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if profile setup is required for jobseeker/employer
  if (isAuthenticated && hasRoleAccess && (role === 'jobseeker' || role === 'employer')) {
    if (!hasCompletedProfile) {
      // Redirect to profile setup
      navigate({ to: '/profile-setup' });
      return (
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
  }

  return <>{children}</>;
}
