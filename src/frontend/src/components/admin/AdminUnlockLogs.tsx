import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetAllUnlockLogs } from '../../hooks/useAdminQueries';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUnlockLogs() {
  const { data: unlockLogs, isLoading } = useGetAllUnlockLogs();

  const flattenedLogs = unlockLogs?.flatMap(([candidatePrincipal, logs]) =>
    logs.map((log) => ({ candidatePrincipal, ...log }))
  ) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unlock Activity Logs</CardTitle>
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
        <CardTitle>Unlock Activity Logs ({flattenedLogs.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {flattenedLogs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employer</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Credits Used</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flattenedLogs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs">
                    {log.employer.toString().slice(0, 15)}...
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.candidatePrincipal.toString().slice(0, 15)}...
                  </TableCell>
                  <TableCell>{log.creditsUsed.toString()}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(Number(log.timestamp) / 1000000).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="py-8 text-center text-muted-foreground">No unlock activity yet</p>
        )}
      </CardContent>
    </Card>
  );
}
