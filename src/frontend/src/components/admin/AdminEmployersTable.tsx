import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';
import { useGetAllEmployers, useAddCredits, useDeductCredits } from '../../hooks/useAdminQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { Employer } from '../../backend';

export default function AdminEmployersTable() {
  const { data: employers, isLoading } = useGetAllEmployers();
  const addCreditsMutation = useAddCredits();
  const deductCreditsMutation = useDeductCredits();
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [actionType, setActionType] = useState<'add' | 'deduct'>('add');

  const handleOpenDialog = (employer: Employer, type: 'add' | 'deduct') => {
    setSelectedEmployer(employer);
    setActionType(type);
    setCreditAmount('');
  };

  const handleSubmit = async () => {
    if (!selectedEmployer || !creditAmount) return;

    const credits = BigInt(creditAmount);
    try {
      if (actionType === 'add') {
        await addCreditsMutation.mutateAsync({
          employerPrincipal: selectedEmployer.principal,
          credits,
        });
        toast.success(`Added ${creditAmount} credits successfully`);
      } else {
        await deductCreditsMutation.mutateAsync({
          employerPrincipal: selectedEmployer.principal,
          credits,
        });
        toast.success(`Deducted ${creditAmount} credits successfully`);
      }
      setSelectedEmployer(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update credits');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employers</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Employers ({employers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {employers && employers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Principal ID</TableHead>
                  <TableHead>Current Credits</TableHead>
                  <TableHead>Total Purchased</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employers.map((employer) => (
                  <TableRow key={employer.principal.toString()}>
                    <TableCell className="font-mono text-xs">
                      {employer.principal.toString().slice(0, 20)}...
                    </TableCell>
                    <TableCell>{employer.credits.toString()}</TableCell>
                    <TableCell>{employer.creditsPurchased.toString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(employer, 'add')}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(employer, 'deduct')}
                        >
                          <Minus className="mr-1 h-3 w-3" />
                          Deduct
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No employers found</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedEmployer} onOpenChange={() => setSelectedEmployer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === 'add' ? 'Add' : 'Deduct'} Credits</DialogTitle>
            <DialogDescription>
              {actionType === 'add' ? 'Add credits to' : 'Deduct credits from'} employer account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Balance</Label>
              <p className="text-2xl font-bold">{selectedEmployer?.credits.toString() || '0'} credits</p>
            </div>
            <div>
              <Label htmlFor="creditAmount">Amount</Label>
              <Input
                id="creditAmount"
                type="number"
                min="1"
                placeholder="Enter credit amount"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEmployer(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!creditAmount || addCreditsMutation.isPending || deductCreditsMutation.isPending}
            >
              {addCreditsMutation.isPending || deductCreditsMutation.isPending
                ? 'Processing...'
                : actionType === 'add'
                  ? 'Add Credits'
                  : 'Deduct Credits'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
