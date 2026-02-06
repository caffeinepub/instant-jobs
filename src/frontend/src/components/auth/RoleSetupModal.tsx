import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useChooseRole, useSaveCallerUserProfile } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, UserCircle } from 'lucide-react';
import { UserRole } from '../../backend';
import { toast } from 'sonner';

export default function RoleSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const chooseRoleMutation = useChooseRole();
  const saveProfileMutation = useSaveCallerUserProfile();

  const [step, setStep] = useState<'role' | 'profile'>('role');
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'employer' | null>(null);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');

  const isAuthenticated = !!identity;
  const showModal = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleRoleSelect = async (role: 'candidate' | 'employer') => {
    setSelectedRole(role);
    setStep('profile');
  };

  const handleProfileSubmit = async () => {
    if (!selectedRole) return;

    if (selectedRole === 'candidate' && !fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (selectedRole === 'employer' && !companyName.trim()) {
      toast.error('Please enter your company name');
      return;
    }

    try {
      await chooseRoleMutation.mutateAsync(UserRole.user);

      const profile = {
        role: UserRole.user,
        bio: '',
        linkedin: '',
        github: '',
        candidate:
          selectedRole === 'candidate'
            ? {
                fullName: fullName.trim(),
                skills: [],
                resume: '',
              }
            : undefined,
        employer:
          selectedRole === 'employer'
            ? {
                companyName: companyName.trim(),
                companyWebsite: '',
                companyLogo: '',
                description: '',
              }
            : undefined,
      };

      await saveProfileMutation.mutateAsync(profile);
      toast.success('Profile created successfully!');
    } catch (error) {
      console.error('Error setting up profile:', error);
      toast.error('Failed to create profile. Please try again.');
    }
  };

  if (!showModal) return null;

  return (
    <Dialog open={showModal}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        {step === 'role' ? (
          <>
            <DialogHeader>
              <DialogTitle>Welcome to Instant Jobs!</DialogTitle>
              <DialogDescription>Choose your role to get started</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <button
                onClick={() => handleRoleSelect('candidate')}
                className="flex flex-col items-center gap-3 rounded-lg border-2 border-border p-6 transition-all hover:border-primary hover:bg-accent"
              >
                <UserCircle className="h-12 w-12 text-primary" />
                <div className="text-center">
                  <h3 className="font-semibold">I'm a Candidate</h3>
                  <p className="text-sm text-muted-foreground">Looking for job opportunities</p>
                </div>
              </button>
              <button
                onClick={() => handleRoleSelect('employer')}
                className="flex flex-col items-center gap-3 rounded-lg border-2 border-border p-6 transition-all hover:border-primary hover:bg-accent"
              >
                <Briefcase className="h-12 w-12 text-primary" />
                <div className="text-center">
                  <h3 className="font-semibold">I'm an Employer</h3>
                  <p className="text-sm text-muted-foreground">Looking to hire talent</p>
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Complete Your Profile</DialogTitle>
              <DialogDescription>
                {selectedRole === 'candidate'
                  ? 'Tell us a bit about yourself'
                  : 'Tell us about your company'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedRole === 'candidate' ? (
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Enter your company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('role')} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleProfileSubmit}
                  disabled={chooseRoleMutation.isPending || saveProfileMutation.isPending}
                  className="flex-1"
                >
                  {chooseRoleMutation.isPending || saveProfileMutation.isPending
                    ? 'Creating...'
                    : 'Complete Setup'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
