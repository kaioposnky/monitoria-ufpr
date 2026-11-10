export type UserRole = 'ALUNO' | 'PROFESSOR' | 'ADMIN';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  registration: string | null;
  courseId: number | null;
  active: boolean;
  isMonitor: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}
