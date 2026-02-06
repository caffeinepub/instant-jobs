import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Briefcase, User, LogOut, Menu, HelpCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import InternetIdentityHelpDialog from './auth/InternetIdentityHelpDialog';

export default function AppHeader() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const isCandidate = userProfile?.candidate !== null && userProfile?.candidate !== undefined;
  const isEmployer = userProfile?.employer !== null && userProfile?.employer !== undefined;

  const navLinks = (
    <>
      <Link
        to="/jobs"
        className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
      >
        Browse Jobs
      </Link>
      {isAuthenticated && isCandidate && (
        <Link
          to="/candidate/dashboard"
          className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
        >
          My Applications
        </Link>
      )}
      {isAuthenticated && isEmployer && (
        <Link
          to="/employer/dashboard"
          className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
        >
          Employer Dashboard
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/generated/instant-jobs-logo.dim_512x512.png"
              alt="Instant Jobs"
              className="h-8 w-8"
            />
            <span className="text-xl font-bold">Instant Jobs</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">{navLinks}</nav>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {userProfile?.candidate && (
                  <DropdownMenuItem asChild>
                    <Link to="/candidate/dashboard" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      My Applications
                    </Link>
                  </DropdownMenuItem>
                )}
                {userProfile?.employer && (
                  <DropdownMenuItem asChild>
                    <Link to="/employer/dashboard" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Employer Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAuth} className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <InternetIdentityHelpDialog
                trigger={
                  <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                }
              />
              <Button onClick={handleAuth} disabled={isLoggingIn} size="sm">
                {isLoggingIn ? 'Signing in...' : 'Sign in with Internet Identity'}
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 pt-8">{navLinks}</nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
