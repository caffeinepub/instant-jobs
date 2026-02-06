import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Briefcase, CreditCard, Activity } from 'lucide-react';
import AdminMetricsCards from '../../components/admin/AdminMetricsCards';
import AdminEmployersTable from '../../components/admin/AdminEmployersTable';
import AdminJobseekersTable from '../../components/admin/AdminJobseekersTable';
import AdminUnlockLogs from '../../components/admin/AdminUnlockLogs';
import AdminCreditsSettings from '../../components/admin/AdminCreditsSettings';

export default function AdminPanelPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage platform users, credits, and monitor activity</p>
      </div>

      <AdminMetricsCards />

      <Tabs defaultValue="employers" className="mt-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employers">
            <Users className="mr-2 h-4 w-4" />
            Employers
          </TabsTrigger>
          <TabsTrigger value="jobseekers">
            <Briefcase className="mr-2 h-4 w-4" />
            Jobseekers
          </TabsTrigger>
          <TabsTrigger value="credits">
            <CreditCard className="mr-2 h-4 w-4" />
            Credits
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="mr-2 h-4 w-4" />
            Unlock Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employers" className="mt-6">
          <AdminEmployersTable />
        </TabsContent>

        <TabsContent value="jobseekers" className="mt-6">
          <AdminJobseekersTable />
        </TabsContent>

        <TabsContent value="credits" className="mt-6">
          <AdminCreditsSettings />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <AdminUnlockLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
