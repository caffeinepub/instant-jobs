import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useGetEmployerCredits() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['employerCredits'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCreditBalance();
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useGetCreditCost() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['creditCost'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCreditCostPerUnlock();
    },
    enabled: !!actor && !isFetching,
  });
}
