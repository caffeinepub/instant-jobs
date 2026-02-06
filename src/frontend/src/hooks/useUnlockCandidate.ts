import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@icp-sdk/core/principal';

export function useUnlockCandidate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidatePrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unlockCandidateProfile(candidatePrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateDirectory'] });
      queryClient.invalidateQueries({ queryKey: ['employerCredits'] });
    },
  });
}
