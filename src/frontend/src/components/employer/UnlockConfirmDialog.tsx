import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useGetCreditCost, useGetEmployerCredits } from '../../hooks/useEmployerCredits';
import { Skeleton } from '@/components/ui/skeleton';

interface UnlockConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  candidateName: string;
}

export default function UnlockConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  candidateName,
}: UnlockConfirmDialogProps) {
  const { data: creditCost, isLoading: costLoading } = useGetCreditCost();
  const { data: currentCredits, isLoading: creditsLoading } = useGetEmployerCredits();

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unlock Candidate Profile</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You are about to unlock the profile for <strong>{candidateName}</strong>.
            </p>
            {costLoading || creditsLoading ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p>Cost: <strong>{creditCost?.toString() || '0'} credits</strong></p>
                <p>Your current balance: <strong>{currentCredits?.toString() || '0'} credits</strong></p>
                {currentCredits && creditCost && currentCredits < creditCost && (
                  <p className="mt-2 text-destructive">
                    ⚠️ Insufficient credits. Please contact admin to add more credits.
                  </p>
                )}
              </div>
            )}
            <p className="text-xs">
              Once unlocked, you will have permanent access to this candidate's full contact details.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={
              costLoading ||
              creditsLoading ||
              !currentCredits ||
              !creditCost ||
              currentCredits < creditCost
            }
          >
            Confirm Unlock
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
