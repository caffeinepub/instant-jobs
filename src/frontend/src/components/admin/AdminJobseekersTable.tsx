import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetAllJobseekers } from '../../hooks/useAdminQueries';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminJobseekersTable() {
  const { data: jobseekers, isLoading } = useGetAllJobseekers();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jobseekers</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobseekers ({jobseekers?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        {jobseekers && jobseekers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Principal ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobseekers.map((principal) => (
                <TableRow key={principal.toString()}>
                  <TableCell className="font-mono text-xs">
                    {principal.toString().slice(0, 40)}...
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-950 dark:text-green-400">
                      Active
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="py-8 text-center text-muted-foreground">No jobseekers found</p>
        )}
      </CardContent>
    </Card>
  );
}
