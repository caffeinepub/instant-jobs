export type UserRole = 'jobseeker' | 'employer' | 'admin' | 'guest';

export interface ManualAuthSession {
  role: UserRole;
  email: string;
  timestamp: number;
  token?: string; // Session token from backend (when implemented)
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface ExperienceEntry {
  companyName: string;
  designation: string;
  process: string;
  lastSalary: string;
  duration: string;
  durationType: 'months' | 'years';
}
