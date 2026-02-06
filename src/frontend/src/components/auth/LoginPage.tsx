import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useManualAuth } from '../../hooks/useManualAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Briefcase, Users, Shield, AlertCircle } from 'lucide-react';
import type { UserRole } from '../../auth/manualAuthTypes';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useManualAuth();
  const navigate = useNavigate();

  const handleLogin = async (role: UserRole) => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await login({ email, password, role });
      
      // Navigate based on role
      if (role === 'admin') {
        navigate({ to: '/admin' });
      } else if (role === 'employer') {
        navigate({ to: '/employer/candidates' });
      } else if (role === 'jobseeker') {
        navigate({ to: '/' });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Instant Jobs</CardTitle>
          <CardDescription>Sign in to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="jobseeker" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="jobseeker">
                <Briefcase className="mr-2 h-4 w-4" />
                Jobseeker
              </TabsTrigger>
              <TabsTrigger value="employer">
                <Users className="mr-2 h-4 w-4" />
                Employer
              </TabsTrigger>
              <TabsTrigger value="admin">
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            {['jobseeker', 'employer', 'admin'].map((role) => (
              <TabsContent key={role} value={role} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${role}-email`}>Email</Label>
                  <Input
                    id={`${role}-email`}
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${role}-password`}>Password</Label>
                  <Input
                    id={`${role}-password`}
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  className="w-full"
                  onClick={() => handleLogin(role as UserRole)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : `Sign in as ${role}`}
                </Button>

                {role === 'admin' && (
                  <p className="text-center text-xs text-muted-foreground">
                    Admin access is restricted to authorized personnel only
                  </p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
