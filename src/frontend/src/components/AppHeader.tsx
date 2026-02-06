import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useManualAuth } from '../hooks/useManualAuth';
import { User, LogOut, Menu, Users, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

export default function AppHeader() {
  const { isAuthenticated, role, logout } = useManualAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/' });
  };

  const navLinks = (
    <>
      {isAuthenticated && role === 'employer' && (
        <Link
          to="/employer/candidates"
          className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
        >
          Candidates
        </Link>
      )}
      {isAuthenticated && role === 'admin' && (
        <Link
          to="/admin"
          className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
        >
          Admin Panel
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
                  {role === 'admin' ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">Logged in as</p>
                  <Badge variant="secondary" className="mt-1">
                    {role}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                {role === 'employer' && (
                  <DropdownMenuItem asChild>
                    <Link to="/employer/candidates" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Candidates
                    </Link>
                  </DropdownMenuItem>
                )}
                {role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Login</Link>
            </Button>
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
