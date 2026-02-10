import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useManualAuth } from '../hooks/useManualAuth';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Briefcase, MapPin, DollarSign, Calendar } from 'lucide-react';

export default function CandidateDashboardPage() {
  const { session } = useManualAuth();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  if (isLoading) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  const candidate = userProfile?.candidate;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {candidate?.fullName || 'Jobseeker'}!</h1>
        <p className="text-muted-foreground">Manage your job search and applications</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Your Profile
            </CardTitle>
            <CardDescription>Your professional information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {candidate?.jobRole && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.jobRole}</span>
              </div>
            )}
            {candidate?.currentOrLastCompany && (
              <div className="text-sm text-muted-foreground">
                at {candidate.currentOrLastCompany}
              </div>
            )}
            {candidate?.preferredLocation && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.preferredLocation}</span>
              </div>
            )}
            {candidate?.totalExperience !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.totalExperience.toString()} years experience</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Applications</CardTitle>
            <CardDescription>Track your applications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Job application tracking coming soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Jobs</CardTitle>
            <CardDescription>Jobs you're interested in</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Job saving feature coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      {candidate?.skills && candidate.skills.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
