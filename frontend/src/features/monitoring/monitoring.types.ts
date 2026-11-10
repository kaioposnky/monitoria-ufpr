import type { UserRole } from '../auth/auth.types';

export const VACANCY_TYPES = ['REMUNERADA', 'VOLUNTARIA'] as const;
export type VacancyType = (typeof VACANCY_TYPES)[number];

export const VACANCY_STATUSES = [
  'ABERTA',
  'EM_SELECAO',
  'ENCERRADA',
  'CANCELADA',
] as const;
export type VacancyStatus = (typeof VACANCY_STATUSES)[number];

export const WEEKDAYS = [
  'SEGUNDA',
  'TERCA',
  'QUARTA',
  'QUINTA',
  'SEXTA',
  'SABADO',
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const REVIEW_DECISIONS = ['APROVADO', 'REPROVADO'] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

export const APPLICATION_STATUSES = [
  'PENDENTE',
  'EM_ANALISE',
  'APROVADO',
  'REPROVADO',
  'DESISTENTE',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const MONITOR_STATUSES = [
  'ATIVO',
  'INATIVO',
  'DESLIGADO',
  'CONCLUIDO',
] as const;
export type MonitorStatus = (typeof MONITOR_STATUSES)[number];

export const ACTIVITY_TYPES = [
  'ATENDIMENTO_DUVIDAS',
  'PREPARACAO_MATERIAL',
  'AUXILIO_AULA_PRATICA',
  'CORRECAO_EXERCICIOS',
  'OUTRO',
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_APPROVAL_STATUSES = [
  'PENDENTE',
  'APROVADO',
  'REJEITADO',
] as const;
export type ActivityApprovalStatus =
  (typeof ACTIVITY_APPROVAL_STATUSES)[number];

export interface ApplicationDraft {
  vacancyId: string;
  studentId: string;
  subjectGrade: string;
  cr: string;
  justification: string;
}

export interface VacancyDraft {
  subjectId: string;
  professorId: string;
  semester: string;
  positions: string;
  type: VacancyType | '';
  requirements: string;
  description: string;
}

export interface OfficeHoursDraft {
  monitorId: string;
  weekday: Weekday | '';
  startTime: string;
  endTime: string;
  location: string;
  meetingLink: string;
}

export interface MonitorReviewDraft {
  applicationId: string;
  decision: ReviewDecision | '';
}

export interface Application {
  id: number;
  vacancyId: number;
  studentId: number;
  subjectGrade: number | null;
  cr: number | null;
  justification: string | null;
  status: ApplicationStatus;
  createdAt: string | null;
}

export interface MonitorRecord {
  id: number;
  vacancyId: number;
  studentId: number;
  applicationId: number | null;
  weeklyHours: number;
  status: MonitorStatus;
  startDate: string;
  endDate: string | null;
}

export interface OfficeHoursRecord {
  id: number;
  monitorId: number;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  location: string;
  meetingLink: string | null;
}

export interface ActivityLogRecord {
  id: number;
  monitorId: number;
  activityDate: string;
  startTime: string;
  endTime: string;
  type: ActivityType;
  description: string;
  studentsHelped: number;
  approvalStatus: ActivityApprovalStatus;
  professorFeedback: string | null;
  createdAt: string | null;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  registration: string | null;
  courseId: number | null;
  active: boolean;
  createdAt: string | null;
}
