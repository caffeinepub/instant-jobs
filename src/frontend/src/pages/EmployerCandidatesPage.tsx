import { useState, useMemo } from 'react';
import { useGetCandidateDirectory } from '../hooks/useQueries';
import { useManualAuth } from '../hooks/useManualAuth';
import { useUnlockCandidate } from '../hooks/useUnlockCandidate';
import { useGetEmployerCredits } from '../hooks/useEmployerCredits';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users, AlertCircle, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CandidateUnlockCard from '../components/employer/CandidateUnlockCard';
import { toast } from 'sonner';
import { Principal } from '@icp-sdk/core/principal';

export default function EmployerCandidatesPage() {
  const { isAuthenticated, role } = useManualAuth();
  const { data: candidates, isLoading: candidatesLoading, error } = useGetCandidateDirectory();
  const { data: credits } = useGetEmployerCredits();
  const unlockMutation = useUnlockCandidate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [unlockedCandidates, setUnlockedCandidates] = useState<Set<string>>(new Set());

  const isEmployer = role === 'employer';

  // Extract all unique skills from candidates
  const allSkills = useMemo(() => {
    if (!candidates) return [];
    const skillSet = new Set<string>();
    candidates.forEach((candidate) => {
      candidate.candidate?.skills.forEach((skill) => skillSet.add(skill));
    });
    return Array.from(skillSet).sort();
  }, [candidates]);

  // Filter candidates based on search keyword and skill filter
  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];

    return candidates.filter((candidate) => {
      const candidateProfile = candidate.candidate;
      if (!candidateProfile) return false;

      // Keyword search across name and bio
      const keywordMatch =
        !searchKeyword ||
        candidateProfile.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        candidate.bio.toLowerCase().includes(searchKeyword.toLowerCase());

      // Skill filter
      const skillMatch =
        !skillFilter ||
        candidateProfile.skills.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase()));

      return keywordMatch && skillMatch;
    });
  }, [candidates, searchKeyword, skillFilter]);

  const handleUnlock = async (candidatePrincipal: Principal) => {
    try {
      const result = await unlockMutation.mutateAsync(candidatePrincipal);
      setUnlockedCandidates((prev) => new Set(prev).add(candidatePrincipal.toString()));
      toast.success(result.status);
    } catch (error: any) {
      const message = error.message || 'Failed to unlock profile';
      if (message.includes('Insufficient credits')) {
        toast.error('Insufficient credits. Please contact admin to add more credits.');
      } else {
        toast.error(message);
      }
    }
  };

  // Show loading state while checking authentication
  if (candidatesLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="mb-8 h-12 w-64" />
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
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Candidate Directory</h1>
          <p className="text-muted-foreground">Browse and unlock candidate profiles</p>
        </div>
        {isEmployer && (
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Available Credits</p>
                <p className="text-lg font-bold">{credits?.toString() || '0'}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or bio..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
            <div>
              <Input
                placeholder="Filter by skill..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              />
            </div>
          </div>
          {allSkills.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Popular skills:</p>
              <div className="flex flex-wrap gap-2">
                {allSkills.slice(0, 10).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => setSkillFilter(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load candidate directory. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Candidates List */}
      {filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              {candidates && candidates.length === 0 ? 'No candidates available' : 'No candidates found'}
            </h3>
            <p className="text-muted-foreground">
              {candidates && candidates.length === 0
                ? 'There are no candidates registered on the platform yet.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCandidates.map((candidate, index) => {
            // In a real implementation, we'd track unlocked status from backend
            // For now, we'll use local state
            const candidatePrincipal = Principal.anonymous(); // Placeholder
            const isUnlocked = unlockedCandidates.has(candidatePrincipal.toString());
            
            return (
              <CandidateUnlockCard
                key={index}
                candidate={candidate}
                isUnlocked={isUnlocked}
                onUnlock={() => handleUnlock(candidatePrincipal)}
              />
            );
          })}
        </div>
      )}

      {/* Results count */}
      {filteredCandidates.length > 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Showing {filteredCandidates.length} of {candidates?.length || 0} candidates
        </div>
      )}
    </div>
  );
}
