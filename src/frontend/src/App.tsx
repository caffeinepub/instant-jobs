import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useManualAuth } from './hooks/useManualAuth';
import LandingPage from './pages/LandingPage';
import LoginPage from './components/auth/LoginPage';
import AdminPanelPage from './pages/admin/AdminPanelPage';
import EmployerCandidatesPage from './pages/EmployerCandidatesPage';
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
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
