import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Job, JobApplication, ApplicationInput, ApplicationStatus } from '../backend';
import { UserRole } from '../backend';
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

export function useChooseRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role: UserRole) => {
      if (!actor) throw new Error('Actor not available');
      assertActorMethod(actor, 'chooseRole', 'useChooseRole');
      await actor.chooseRole(role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
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

export function useGetJobs() {
  const { actor, isFetching } = useActor();

  return useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      if (!actor) return [];
      assertActorMethod(actor, 'getJobs', 'useGetJobs');
      return actor.getJobs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetJob(jobId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Job | null>({
    queryKey: ['job', jobId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        assertActorMethod(actor, 'getJob', 'useGetJob');
        return await actor.getJob(jobId);
      } catch (error) {
        console.error('Error fetching job:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetJobsByEmployer() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Job[]>({
    queryKey: ['employerJobs', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      assertActorMethod(actor, 'getJobsByEmployer', 'useGetJobsByEmployer');
      return actor.getJobsByEmployer(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateJob() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: Omit<Job, 'id' | 'employer'>) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Identity not available');
      
      assertActorMethod(actor, 'createJob', 'useCreateJob');
      
      const jobWithDefaults: Job = {
        ...job,
        id: BigInt(0),
        employer: identity.getPrincipal(),
      };
      await actor.createJob(jobWithDefaults);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['employerJobs'] });
    },
  });
}

export function useDeleteJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      assertActorMethod(actor, 'deleteJob', 'useDeleteJob');
      await actor.deleteJob(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['employerJobs'] });
    },
  });
}

export function useApplyForJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (application: ApplicationInput) => {
      if (!actor) throw new Error('Actor not available');
      assertActorMethod(actor, 'applyForJob', 'useApplyForJob');
      await actor.applyForJob(application);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateApplications'] });
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
  });
}

export function useGetCandidateApplications() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<JobApplication[]>({
    queryKey: ['candidateApplications', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      assertActorMethod(actor, 'getApplicationsForCandidate', 'useGetCandidateApplications');
      return actor.getApplicationsForCandidate(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetJobApplications(jobId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<JobApplication[]>({
    queryKey: ['jobApplications', jobId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        assertActorMethod(actor, 'getApplicationsForJob', 'useGetJobApplications');
        return await actor.getApplicationsForJob(jobId);
      } catch (error) {
        console.error('Error fetching applications:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: ApplicationStatus }) => {
      if (!actor) throw new Error('Actor not available');
      assertActorMethod(actor, 'updateApplicationStatus', 'useUpdateApplicationStatus');
      await actor.updateApplicationStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateApplications'] });
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
  });
}
