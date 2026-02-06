import { useParams, Link } from '@tanstack/react-router';
import { useGetJob, useGetJobApplications, useUpdateApplicationStatus } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ApplicationStatus } from '../backend';
import { toast } from 'sonner';
import { normalizeActorError } from '../utils/actorErrorMessages';

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

export default function EmployerJobApplicationsPage() {
  const { jobId } = useParams({ from: '/employer/jobs/$jobId/applications' });
  const { data: job, isLoading: jobLoading } = useGetJob(BigInt(jobId));
  const { data: applications, isLoading: applicationsLoading } = useGetJobApplications(BigInt(jobId));
  const updateStatusMutation = useUpdateApplicationStatus();

  const isLoading = jobLoading || applicationsLoading;

  const handleStatusChange = async (applicationId: bigint, newStatus: ApplicationStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: applicationId, status: newStatus });
      toast.success('Application status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = normalizeActorError(error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container py-8">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/employer/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ) : !job ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <h3 className="mb-2 text-lg font-semibold">Job not found</h3>
            <Button asChild>
              <Link to="/employer/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">{job.title}</h1>
            <p className="text-muted-foreground">
              {applications?.length || 0} application{applications?.length !== 1 ? 's' : ''}
            </p>
          </div>

          {!applications || applications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <User className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No applications yet</h3>
                <p className="text-muted-foreground">
                  Applications for this job will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id.toString()}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          Candidate: {app.candidate.toString().slice(0, 10)}...
                        </CardTitle>
                      </div>
                      <Badge className={statusColors[app.status]}>
                        {statusLabels[app.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Cover Letter</h4>
                      <p className="text-sm text-muted-foreground">{app.coverLetter}</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Update Status</label>
                      <Select
                        value={app.status}
                        onValueChange={(value) => handleStatusChange(app.id, value as ApplicationStatus)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="offer">Offer</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="hired">Hired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
