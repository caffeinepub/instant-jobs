import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import LandingPage from './pages/LandingPage';
import JobsBrowsePage from './pages/JobsBrowsePage';
import JobDetailPage from './pages/JobDetailPage';
import CandidateDashboardPage from './pages/CandidateDashboardPage';
import EmployerDashboardPage from './pages/EmployerDashboardPage';
import EmployerJobApplicationsPage from './pages/EmployerJobApplicationsPage';
import AppLayout from './components/AppLayout';
import RoleSetupModal from './components/auth/RoleSetupModal';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

function RootLayout() {
  return (
    <AppLayout>
      <RoleSetupModal />
      <Outlet />
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

const jobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jobs',
  component: JobsBrowsePage,
});

const jobDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jobs/$jobId',
  component: JobDetailPage,
});

const candidateDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/candidate/dashboard',
  component: CandidateDashboardPage,
});

const employerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employer/dashboard',
  component: EmployerDashboardPage,
});

const employerJobApplicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employer/jobs/$jobId/applications',
  component: EmployerJobApplicationsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  jobsRoute,
  jobDetailRoute,
  candidateDashboardRoute,
  employerDashboardRoute,
  employerJobApplicationsRoute,
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
