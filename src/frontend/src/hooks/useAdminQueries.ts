import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@icp-sdk/core/principal';
import type { Employer, UnlockRecord } from '../backend';

export function useGetAllEmployers() {
  const { actor, isFetching } = useActor();

  return useQuery<Employer[]>({
    queryKey: ['allEmployers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllEmployers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllJobseekers() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['allJobseekers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllJobseekers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUnlockLogs() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[Principal, UnlockRecord[]]>>({
    queryKey: ['allUnlockLogs'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllUnlockLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCredits() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employerPrincipal, credits }: { employerPrincipal: Principal; credits: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addCredits(employerPrincipal, credits);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEmployers'] });
    },
  });
}

export function useDeductCredits() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employerPrincipal, credits }: { employerPrincipal: Principal; credits: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deductCredits(employerPrincipal, credits);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEmployers'] });
    },
  });
}

export function useSetCreditCost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cost: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setCreditCostPerUnlock(cost);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditCost'] });
    },
  });
}
