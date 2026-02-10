import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useManualAuth } from '../../hooks/useManualAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Briefcase, Users, AlertCircle } from 'lucide-react';
import type { UserRole } from '../../auth/manualAuthTypes';
import { normalizeActorError } from '../../utils/actorErrorMessages';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useManualAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent, role: UserRole) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await signup({ email, password, role });
      
      // After successful signup, redirect to profile setup
      navigate({ to: '/profile-setup' });
    } catch (err: any) {
      setError(normalizeActorError(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>Join Instant Jobs to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="jobseeker" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="jobseeker">
                <Briefcase className="mr-2 h-4 w-4" />
                Jobseeker
              </TabsTrigger>
              <TabsTrigger value="employer">
                <Users className="mr-2 h-4 w-4" />
                Employer
              </TabsTrigger>
            </TabsList>

            {['jobseeker', 'employer'].map((role) => (
              <TabsContent key={role} value={role}>
                <form onSubmit={(e) => handleSignup(e, role as UserRole)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${role}-email`}>Email</Label>
                    <Input
                      id={`${role}-email`}
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${role}-password`}>Password</Label>
                    <Input
                      id={`${role}-password`}
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${role}-confirm-password`}>Confirm Password</Label>
                    <Input
                      id={`${role}-confirm-password`}
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : `Sign up as ${role}`}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
