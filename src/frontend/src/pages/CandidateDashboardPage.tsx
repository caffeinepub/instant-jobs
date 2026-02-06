import { useGetCandidateApplications, useGetJobs } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Briefcase, MapPin, Building2, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { ApplicationStatus } from '../backend';

const statusColors: Record<ApplicationStatus, string> = {
  applied: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  interview: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  offer: 'bg-green-500/10 text-green-700 dark:text-green-400',
  rejected: 'bg-red-500/10 text-red-700 dark:text-red-400',
  withdrawn: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  hired: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
};

const statusLabels: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  hired: 'Hired',
};

export default function CandidateDashboardPage() {
  const { data: applications, isLoading: applicationsLoading } = useGetCandidateApplications();
  const { data: jobs, isLoading: jobsLoading } = useGetJobs();

  const isLoading = applicationsLoading || jobsLoading;

  const applicationsWithJobs = applications?.map((app) => ({
    ...app,
    job: jobs?.find((j) => j.id === app.jobId),
  }));

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">
          Track the status of your job applications
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-4 h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !applicationsWithJobs || applicationsWithJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No applications yet</h3>
            <p className="mb-4 text-muted-foreground">
              Start applying to jobs to see your applications here
            </p>
            <Button asChild>
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applicationsWithJobs.map((app) => (
            <Card key={app.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      {app.job?.title || 'Job not found'}
                    </CardTitle>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {app.job && (
                        <>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {app.job.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {app.job.location}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge className={statusColors[app.status]}>
                    {statusLabels[app.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Cover Letter</h4>
                    <p className="text-sm text-muted-foreground">{app.coverLetter}</p>
                  </div>
                  {app.job && (
                    <Button variant="outline" asChild>
                      <Link to="/jobs/$jobId" params={{ jobId: app.jobId.toString() }}>
                        View Job Details
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
