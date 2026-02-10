import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useManualAuth } from '../../hooks/useManualAuth';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { normalizeActorError } from '../../utils/actorErrorMessages';
import type { UserProfile, CandidateProfile, EmployerProfile } from '../../backend';
import type { ExperienceEntry } from '../../auth/manualAuthTypes';

export default function ProfileSetupPage() {
  const { role, session, markProfileComplete } = useManualAuth();
  const navigate = useNavigate();
  const saveProfile = useSaveCallerUserProfile();

  const [error, setError] = useState('');

  // Jobseeker fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [experienceStatus, setExperienceStatus] = useState<'Fresher' | 'Experienced'>('Fresher');
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([]);

  // Employer fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  const addExperience = () => {
    if (experiences.length >= 5) {
      setError('You can add a maximum of 5 experience entries');
      return;
    }
    setError('');
    setExperiences([
      ...experiences,
      {
        companyName: '',
        designation: '',
        process: '',
        lastSalary: '',
        duration: '',
        durationType: 'months',
      },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
    setError('');
  };

  const updateExperience = (index: number, field: keyof ExperienceEntry, value: string) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let profile: UserProfile;

      if (role === 'jobseeker') {
        if (!fullName || !mobileNumber || !session?.email || !currentLocation) {
          setError('Please fill in all required fields');
          return;
        }

        // Validate experience entries if Experienced
        if (experienceStatus === 'Experienced') {
          if (experiences.length === 0) {
            setError('Please add at least one experience entry');
            return;
          }

          for (let i = 0; i < experiences.length; i++) {
            const exp = experiences[i];
            if (!exp.companyName || !exp.designation || !exp.process || !exp.lastSalary || !exp.duration) {
              setError(`Please fill in all fields for experience entry ${i + 1}`);
              return;
            }
          }
        }

        // Build candidate profile
        let currentCompany = '';
        let jobRole = '';
        let totalExperience = 0;
        let lastDrawnSalary = 0;

        if (experienceStatus === 'Experienced' && experiences.length > 0) {
          // Use the first (most recent) experience
          const recentExp = experiences[0];
          currentCompany = recentExp.companyName;
          jobRole = recentExp.designation;
          lastDrawnSalary = parseInt(recentExp.lastSalary) || 0;

          // Calculate total experience from all entries
          totalExperience = experiences.reduce((total, exp) => {
            const duration = parseInt(exp.duration) || 0;
            const months = exp.durationType === 'years' ? duration * 12 : duration;
            return total + months;
          }, 0);
          // Convert to years
          totalExperience = Math.floor(totalExperience / 12);
        }

        const candidateProfile: CandidateProfile = {
          fullName,
          mobileNumber,
          email: session.email,
          currentOrLastCompany: currentCompany,
          jobRole,
          totalExperience: BigInt(totalExperience),
          lastDrawnSalary: BigInt(lastDrawnSalary),
          preferredLocation: currentLocation,
          isActive: true,
          skills: [],
          resume: '',
        };

        profile = {
          bio: '',
          linkedin: '',
          github: '',
          candidate: candidateProfile,
        };
      } else if (role === 'employer') {
        if (!companyName || !contactPerson || !mobileNumber || !session?.email) {
          setError('Please fill in all required fields');
          return;
        }

        const employerProfile: EmployerProfile = {
          companyName,
          contactPersonName: contactPerson,
          mobileNumber,
          email: session.email,
          businessLocation,
          companyWebsite: website,
          companyLogo: '',
          description,
        };

        profile = {
          bio: '',
          linkedin: '',
          github: '',
          employer: employerProfile,
        };
      } else {
        setError('Invalid role for profile setup');
        return;
      }

      await saveProfile.mutateAsync(profile);

      // Mark profile as complete in manual auth
      markProfileComplete();

      // Navigate to appropriate dashboard
      if (role === 'jobseeker') {
        navigate({ to: '/jobseeker/dashboard' });
      } else if (role === 'employer') {
        navigate({ to: '/employer/candidates' });
      }
    } catch (err: any) {
      setError(normalizeActorError(err));
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            {role === 'jobseeker' 
              ? 'Tell us about yourself to get started with job applications'
              : 'Set up your company profile to start hiring'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {role === 'jobseeker' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    disabled={saveProfile.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number *</Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter your mobile number"
                    required
                    disabled={saveProfile.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email ID *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={session?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email from your account</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentLocation">Current Location *</Label>
                  <Input
                    id="currentLocation"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    placeholder="e.g., Bangalore, Mumbai"
                    required
                    disabled={saveProfile.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceStatus">Experience Status *</Label>
                  <Select
                    value={experienceStatus}
                    onValueChange={(value) => {
                      setExperienceStatus(value as 'Fresher' | 'Experienced');
                      if (value === 'Fresher') {
                        setExperiences([]);
                        setError('');
                      }
                    }}
                    disabled={saveProfile.isPending}
                  >
                    <SelectTrigger id="experienceStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fresher">Fresher</SelectItem>
                      <SelectItem value="Experienced">Experienced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {experienceStatus === 'Experienced' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Work Experience</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addExperience}
                        disabled={experiences.length >= 5 || saveProfile.isPending}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Experience
                      </Button>
                    </div>

                    {experiences.length === 0 && (
                      <Alert>
                        <AlertDescription>
                          Click "Add Experience" to add your work experience details
                        </AlertDescription>
                      </Alert>
                    )}

                    {experiences.map((exp, index) => (
                      <Card key={index} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Experience {index + 1}</CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExperience(index)}
                              disabled={saveProfile.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`company-${index}`}>Company Name *</Label>
                            <Input
                              id={`company-${index}`}
                              value={exp.companyName}
                              onChange={(e) => updateExperience(index, 'companyName', e.target.value)}
                              placeholder="Company name"
                              disabled={saveProfile.isPending}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`designation-${index}`}>Designation *</Label>
                            <Input
                              id={`designation-${index}`}
                              value={exp.designation}
                              onChange={(e) => updateExperience(index, 'designation', e.target.value)}
                              placeholder="Your role/title"
                              disabled={saveProfile.isPending}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`process-${index}`}>Process *</Label>
                            <Input
                              id={`process-${index}`}
                              value={exp.process}
                              onChange={(e) => updateExperience(index, 'process', e.target.value)}
                              placeholder="e.g., Voice, Non-voice, Technical Support"
                              disabled={saveProfile.isPending}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`salary-${index}`}>Last Salary (₹) *</Label>
                            <Input
                              id={`salary-${index}`}
                              type="number"
                              min="0"
                              value={exp.lastSalary}
                              onChange={(e) => updateExperience(index, 'lastSalary', e.target.value)}
                              placeholder="Annual salary"
                              disabled={saveProfile.isPending}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`duration-${index}`}>Duration *</Label>
                              <Input
                                id={`duration-${index}`}
                                type="number"
                                min="0"
                                value={exp.duration}
                                onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                                placeholder="Duration"
                                disabled={saveProfile.isPending}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`durationType-${index}`}>Unit *</Label>
                              <Select
                                value={exp.durationType}
                                onValueChange={(value) => updateExperience(index, 'durationType', value)}
                                disabled={saveProfile.isPending}
                              >
                                <SelectTrigger id={`durationType-${index}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="months">Months</SelectItem>
                                  <SelectItem value="years">Years</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {experiences.length >= 5 && (
                      <Alert>
                        <AlertDescription>
                          Maximum of 5 experience entries reached
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                    required
                    disabled={saveProfile.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person Name *</Label>
                  <Input
                    id="contactPerson"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Your name"
                    required
                    disabled={saveProfile.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number *</Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Contact number"
                    required
                    disabled={saveProfile.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email ID *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={session?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email from your account</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessLocation">Business Location</Label>
                  <Input
                    id="businessLocation"
                    value={businessLocation}
                    onChange={(e) => setBusinessLocation(e.target.value)}
                    placeholder="City or address"
                    disabled={saveProfile.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Company Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    disabled={saveProfile.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your company"
                    rows={4}
                    disabled={saveProfile.isPending}
                  />
                </div>
              </>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={saveProfile.isPending}
            >
              {saveProfile.isPending ? 'Saving...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
