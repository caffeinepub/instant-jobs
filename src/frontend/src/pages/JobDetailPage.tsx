import { useParams, Link } from '@tanstack/react-router';
import { useGetJob, useGetCandidateApplications } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import CandidateApplyForm from '../components/applications/CandidateApplyForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Briefcase, DollarSign, Building2, CheckCircle, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

export default function JobDetailPage() {
  const { jobId } = useParams({ from: '/jobs/$jobId' });
  const { data: job, isLoading } = useGetJob(BigInt(jobId));
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: applications } = useGetCandidateApplications();
  const [showApplyForm, setShowApplyForm] = useState(false);

  const isAuthenticated = !!identity;
  const isCandidate = userProfile?.candidate !== null && userProfile?.candidate !== undefined;
  const hasApplied = applications?.some((app) => app.jobId.toString() === jobId);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <Skeleton className="mb-2 h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <h3 className="mb-2 text-lg font-semibold">Job not found</h3>
            <p className="mb-4 text-muted-foreground">
              The job you're looking for doesn't exist or has been removed
            </p>
            <Button asChild>
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/jobs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {job.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salary.toString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">Job Description</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">{job.description}</p>
              </div>

              {job.requirements.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Requirements</h3>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="text-muted-foreground">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Apply for this job</CardTitle>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    You need to sign in with Internet Identity to apply for this job
                  </p>
                  <Button className="w-full" asChild>
                    <Link to="/">Sign in to Apply</Link>
                  </Button>
                </div>
              ) : !isCandidate ? (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Only candidates can apply for jobs. Please set up a candidate profile.
                  </p>
                </div>
              ) : hasApplied ? (
                <div className="space-y-4 text-center">
                  <Badge variant="secondary" className="mb-2">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Applied
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    You have already applied for this job. Check your dashboard for updates.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/candidate/dashboard">View Applications</Link>
                  </Button>
                </div>
              ) : showApplyForm ? (
                <CandidateApplyForm
                  jobId={job.id}
                  onSuccess={() => setShowApplyForm(false)}
                  onCancel={() => setShowApplyForm(false)}
                />
              ) : (
                <Button className="w-full" onClick={() => setShowApplyForm(true)}>
                  Apply Now
                </Button>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
