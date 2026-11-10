import type { UserRole } from '../auth/auth.types';
import type { Subject, Vacancy } from '../catalog/catalog.types';
import type {
  ActivityApprovalStatus,
  ActivityType,
  ApplicationStatus,
  MonitorStatus,
  ReviewDecision,
  VacancyStatus,
  VacancyType,
  Weekday,
} from './monitoring.types';

export const VACANCY_TYPE_LABELS: Record<VacancyType, string> = {
  REMUNERADA: 'Remunerada',
  VOLUNTARIA: 'Voluntária',
};

export const VACANCY_STATUS_LABELS: Record<VacancyStatus, string> = {
  ABERTA: 'Aberta',
  EM_SELECAO: 'Em seleção',
  ENCERRADA: 'Encerrada',
  CANCELADA: 'Cancelada',
};

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  SEGUNDA: 'Segunda-feira',
  TERCA: 'Terça-feira',
  QUARTA: 'Quarta-feira',
  QUINTA: 'Quinta-feira',
  SEXTA: 'Sexta-feira',
  SABADO: 'Sábado',
};

export const REVIEW_DECISION_LABELS: Record<ReviewDecision, string> = {
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em análise',
  APROVADO: 'Aprovada',
  REPROVADO: 'Reprovada',
  DESISTENTE: 'Desistente',
};

export const MONITOR_STATUS_LABELS: Record<MonitorStatus, string> = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  DESLIGADO: 'Desligado',
  CONCLUIDO: 'Concluído',
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  ATENDIMENTO_DUVIDAS: 'Atendimento de dúvidas',
  PREPARACAO_MATERIAL: 'Preparação de material',
  AUXILIO_AULA_PRATICA: 'Auxílio em aula prática',
  CORRECAO_EXERCICIOS: 'Correção de exercícios',
  OUTRO: 'Outro',
};

export const ACTIVITY_APPROVAL_LABELS: Record<ActivityApprovalStatus, string> = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ALUNO: 'Aluno',
  PROFESSOR: 'Professor',
  ADMIN: 'Administrador',
};

export function isPositiveInteger(value: string): boolean {
  return /^[1-9]\d*$/.test(value.trim());
}

export function isNonNegativeInteger(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

export function isScoreInRange(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\d{1,3}(?:\.\d{1,2})?$/.test(trimmed)) return false;
  const score = Number(trimmed);
  return score >= 0 && score <= 100;
}

export function isSemester(value: string): boolean {
  return /^\d{4}\/[12]$/.test(value.trim());
}

export function isValidTime(value: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isEndAfterStart(start: string, end: string): boolean {
  return isValidTime(start) && isValidTime(end) && end > start;
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function formatTimeShort(value: string): string {
  return value.length >= 5 ? value.slice(0, 5) : value;
}

export function displayOptional(
  value: string,
  emptyLabel = 'Não informado',
): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : emptyLabel;
}

export function formatSubjectLabel(subject: Subject): string {
  return subject.code + ' — ' + subject.name;
}

export function formatVacancyLabel(
  vacancy: Vacancy,
  subject?: Subject,
): string {
  const subjectLabel = subject
    ? formatSubjectLabel(subject)
    : 'Matéria #' + vacancy.subjectId;
  const typeLabel =
    VACANCY_TYPE_LABELS[vacancy.type as VacancyType] || vacancy.type;
  return (
    subjectLabel +
    ' · ' +
    vacancy.semester +
    ' · ' +
    typeLabel +
    ' · ' +
    vacancy.positions +
    ' vaga(s)'
  );
}
