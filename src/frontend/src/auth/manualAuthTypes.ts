export type UserRole = 'jobseeker' | 'employer' | 'admin' | 'guest';

export interface ManualAuthSession {
  role: UserRole;
  email: string;
  timestamp: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}
