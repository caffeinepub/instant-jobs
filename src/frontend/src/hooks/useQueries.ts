import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile } from '../backend';
import { assertActorMethod } from '../utils/actorGuards';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      assertActorMethod(actor, 'getCallerUserProfile', 'useGetCallerUserProfile');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      assertActorMethod(actor, 'saveCallerUserProfile', 'useSaveCallerUserProfile');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCandidateDirectory() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['candidateDirectory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      assertActorMethod(actor, 'getCandidateDirectory', 'useGetCandidateDirectory');
      return await actor.getCandidateDirectory();
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}
