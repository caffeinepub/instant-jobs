import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetCreditCost } from '../../hooks/useEmployerCredits';
import { useSetCreditCost } from '../../hooks/useAdminQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function AdminCreditsSettings() {
  const { data: currentCost, isLoading } = useGetCreditCost();
  const setCostMutation = useSetCreditCost();
  const [newCost, setNewCost] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCost) return;

    try {
      await setCostMutation.mutateAsync(BigInt(newCost));
      toast.success('Credit cost updated successfully');
      setNewCost('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update credit cost');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Current Cost Per Unlock</Label>
          {isLoading ? (
            <Skeleton className="mt-2 h-10 w-32" />
          ) : (
            <p className="mt-2 text-3xl font-bold">{currentCost?.toString() || '0'} credits</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newCost">Set New Cost Per Unlock</Label>
            <Input
              id="newCost"
              type="number"
              min="1"
              placeholder="Enter new cost"
              value={newCost}
              onChange={(e) => setNewCost(e.target.value)}
              className="mt-2"
            />
          </div>
          <Button type="submit" disabled={!newCost || setCostMutation.isPending}>
            {setCostMutation.isPending ? 'Updating...' : 'Update Cost'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
