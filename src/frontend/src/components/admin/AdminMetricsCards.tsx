import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, CreditCard } from 'lucide-react';
import { useGetAllEmployers, useGetAllJobseekers } from '../../hooks/useAdminQueries';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminMetricsCards() {
  const { data: employers, isLoading: employersLoading } = useGetAllEmployers();
  const { data: jobseekers, isLoading: jobseekersLoading } = useGetAllJobseekers();

  const totalCreditsUsed = employers?.reduce((sum, emp) => sum + Number(emp.creditsPurchased), 0) || 0;

  const metrics = [
    {
      title: 'Total Employers',
      value: employersLoading ? <Skeleton className="h-8 w-16" /> : employers?.length || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
    {
      title: 'Total Jobseekers',
      value: jobseekersLoading ? <Skeleton className="h-8 w-16" /> : jobseekers?.length || 0,
      icon: Briefcase,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      title: 'Credits Used',
      value: employersLoading ? <Skeleton className="h-8 w-16" /> : totalCreditsUsed,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <div className={`rounded-lg p-2 ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
