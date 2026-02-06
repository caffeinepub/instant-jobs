import { useState } from 'react';
import { useGetJobsByEmployer, useDeleteJob } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Plus, Trash2, Users, MapPin, Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import EmployerJobForm from '../components/jobs/EmployerJobForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function EmployerDashboardPage() {
  const { data: jobs, isLoading } = useGetJobsByEmployer();
  const deleteJobMutation = useDeleteJob();
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<bigint | null>(null);

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      await deleteJobMutation.mutateAsync(jobToDelete);
      toast.success('Job deleted successfully');
      setJobToDelete(null);
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Employer Dashboard</h1>
          <p className="text-muted-foreground">Manage your job postings and applications</p>
        </div>
        <Button onClick={() => setShowJobForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Post New Job
        </Button>
      </div>

      {showJobForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Post a New Job</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployerJobForm onSuccess={() => setShowJobForm(false)} onCancel={() => setShowJobForm(false)} />
          </CardContent>
        </Card>
      )}

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
      ) : !jobs || jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No jobs posted yet</h3>
            <p className="mb-4 text-muted-foreground">
              Create your first job posting to start receiving applications
            </p>
            <Button onClick={() => setShowJobForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Post Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {job.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setJobToDelete(job.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link to="/employer/jobs/$jobId/applications" params={{ jobId: job.id.toString() }}>
                      <Users className="mr-2 h-4 w-4" />
                      View Applications
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/jobs/$jobId" params={{ jobId: job.id.toString() }}>
                      View Job Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job posting? This action cannot be undone and all
              applications will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
