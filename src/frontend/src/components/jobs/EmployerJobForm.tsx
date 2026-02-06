import { useState } from 'react';
import { useCreateJob } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { normalizeActorError } from '../../utils/actorErrorMessages';

interface EmployerJobFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EmployerJobForm({ onSuccess, onCancel }: EmployerJobFormProps) {
  const createJobMutation = useCreateJob();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>(['']);

  const handleAddRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !company.trim() || !location.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const filteredRequirements = requirements.filter((req) => req.trim() !== '');

    try {
      await createJobMutation.mutateAsync({
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        salary: salary.trim() ? BigInt(salary) : undefined,
        description: description.trim(),
        requirements: filteredRequirements,
      });
      toast.success('Job posted successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating job:', error);
      const errorMessage = normalizeActorError(error);
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Senior Software Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company Name *</Label>
          <Input
            id="company"
            placeholder="e.g., Tech Corp"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            placeholder="e.g., San Francisco, CA"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary">Salary (optional)</Label>
          <Input
            id="salary"
            type="number"
            placeholder="e.g., 120000"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Job Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe the role, responsibilities, and what you're looking for..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Requirements</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddRequirement}>
            Add Requirement
          </Button>
        </div>
        <div className="space-y-2">
          {requirements.map((req, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="e.g., 5+ years of experience with React"
                value={req}
                onChange={(e) => handleRequirementChange(index, e.target.value)}
              />
              {requirements.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveRequirement(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={createJobMutation.isPending} className="flex-1">
          {createJobMutation.isPending ? 'Posting...' : 'Post Job'}
        </Button>
      </div>
    </form>
  );
}
