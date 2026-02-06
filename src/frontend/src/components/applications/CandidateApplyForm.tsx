import { useState } from 'react';
import { useApplyForJob } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { normalizeActorError } from '../../utils/actorErrorMessages';

interface CandidateApplyFormProps {
  jobId: bigint;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CandidateApplyForm({ jobId, onSuccess, onCancel }: CandidateApplyFormProps) {
  const applyMutation = useApplyForJob();
  const [coverLetter, setCoverLetter] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coverLetter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }

    try {
      await applyMutation.mutateAsync({
        jobId,
        coverLetter: coverLetter.trim(),
      });
      toast.success('Application submitted successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error applying for job:', error);
      const errorMessage = normalizeActorError(error);
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="coverLetter">Cover Letter *</Label>
        <Textarea
          id="coverLetter"
          placeholder="Tell the employer why you're a great fit for this role..."
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={8}
          required
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={applyMutation.isPending} className="flex-1">
          {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </form>
  );
}
