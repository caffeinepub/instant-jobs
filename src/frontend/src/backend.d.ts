import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UnlockRecord {
    employer: Principal;
    timestamp: bigint;
    candidate: Principal;
    creditsUsed: bigint;
    profileDetails: CandidateProfile;
}
export interface UnlockResult {
    status: string;
    currentCredits: bigint;
    remainingCredits: bigint;
}
export interface Employer {
    principal: Principal;
    credits: bigint;
    creditsPurchased: bigint;
}
export interface CandidateProfile {
    resume: string;
    currentOrLastCompany: string;
    jobRole: string;
    totalExperience: bigint;
    lastDrawnSalary: bigint;
    fullName: string;
    mobileNumber: MobileNumber;
    isActive: boolean;
    email: string;
    preferredLocation: string;
    skills: Array<string>;
}
export interface EmployerProfile {
    description: string;
    mobileNumber: MobileNumber;
    businessLocation: string;
    email: string;
    companyLogo: string;
    companyName: string;
    companyWebsite: string;
    contactPersonName: string;
}
export interface UserProfile {
    bio: string;
    linkedin: string;
    employer?: EmployerProfile;
    candidate?: CandidateProfile;
    github: string;
}
export type MobileNumber = string;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCredits(employerPrincipal: Principal, credits: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deductCredits(employerPrincipal: Principal, credits: bigint): Promise<void>;
    getAllEmployers(): Promise<Array<Employer>>;
    getAllJobseekers(): Promise<Array<Principal>>;
    getAllUnlockLogs(): Promise<Array<[Principal, Array<UnlockRecord>]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCandidateDirectory(): Promise<Array<UserProfile>>;
    getCreditBalance(): Promise<bigint>;
    getCreditCostPerUnlock(): Promise<bigint>;
    getCurrentUserProfile(): Promise<UserProfile | null>;
    getEmployerCredits(employerPrincipal: Principal): Promise<Employer | null>;
    getProfile(p: Principal): Promise<UserProfile>;
    getSessionTimeout(): Promise<bigint>;
    getUserProfile(p: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setCreditCostPerUnlock(cost: bigint): Promise<void>;
    setSessionTimeout(timeout: bigint): Promise<void>;
    unlockCandidateProfile(candidatePrincipal: Principal): Promise<UnlockResult>;
}
