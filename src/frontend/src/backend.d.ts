import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Job {
    id: bigint;
    title: string;
    salary?: bigint;
    description: string;
    company: string;
    employer: Principal;
    requirements: Array<string>;
    location: string;
}
export interface ApplicationInput {
    jobId: bigint;
    coverLetter: string;
}
export interface JobApplication {
    id: bigint;
    status: ApplicationStatus;
    jobId: bigint;
    coverLetter: string;
    candidate: Principal;
}
export interface CandidateProfile {
    resume: string;
    fullName: string;
    skills: Array<string>;
}
export interface EmployerProfile {
    description: string;
    companyLogo: string;
    companyName: string;
    companyWebsite: string;
}
export interface UserProfile {
    bio: string;
    linkedin: string;
    role: UserRole;
    employer?: EmployerProfile;
    candidate?: CandidateProfile;
    github: string;
}
export enum ApplicationStatus {
    hired = "hired",
    offer = "offer",
    interview = "interview",
    applied = "applied",
    rejected = "rejected",
    withdrawn = "withdrawn"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    applyForJob(application: ApplicationInput): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    chooseRole(role: UserRole): Promise<void>;
    createJob(job: Job): Promise<void>;
    deleteJob(id: bigint): Promise<void>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getApplications(): Promise<Array<JobApplication>>;
    getApplicationsForCandidate(candidate: Principal): Promise<Array<JobApplication>>;
    getApplicationsForJob(jobId: bigint): Promise<Array<JobApplication>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getJob(id: bigint): Promise<Job>;
    getJobs(): Promise<Array<Job>>;
    getJobsByEmployer(employer: Principal): Promise<Array<Job>>;
    getUserProfile(p: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateApplicationStatus(id: bigint, status: ApplicationStatus): Promise<void>;
    updateUserProfile(profile: UserProfile): Promise<void>;
}
