import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useManualAuth, ManualAuthProvider } from './hooks/useManualAuth';
import LandingPage from './pages/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ProfileSetupPage from './components/profile/ProfileSetupPage';
import AdminPanelPage from './pages/admin/AdminPanelPage';
import EmployerCandidatesPage from './pages/EmployerCandidatesPage';
import CandidateDashboardPage from './pages/CandidateDashboardPage';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

function RootLayout() {
  const { role } = useManualAuth();
  
  return (
    <AppLayout>
      <div data-role={role}>
        <Outlet />
      </div>
    </AppLayout>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignupPage,
});

const profileSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile-setup',
  component: () => (
    <ProtectedRoute requiredRole={['jobseeker', 'employer']}>
      <ProfileSetupPage />
    </ProtectedRoute>
  ),
});

const candidateDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jobseeker/dashboard',
  component: () => (
    <ProtectedRoute requiredRole="jobseeker">
      <CandidateDashboardPage />
    </ProtectedRoute>
  ),
});

const employerCandidatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employer/candidates',
  component: () => (
    <ProtectedRoute requiredRole="employer">
      <EmployerCandidatesPage />
    </ProtectedRoute>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <ProtectedRoute requiredRole="admin">
      <AdminPanelPage />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  profileSetupRoute,
  candidateDashboardRoute,
  employerCandidatesRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ManualAuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </ManualAuthProvider>
    </ThemeProvider>
  );
}
