export const VACANCY_TYPES = ['REMUNERADA', 'VOLUNTARIA'] as const;
export type VacancyType = (typeof VACANCY_TYPES)[number];

export type VacancyStatus = 'ABERTA' | 'EM_SELECAO' | 'ENCERRADA' | 'CANCELADA';

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
  observation: string;
}
