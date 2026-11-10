import {
  ApiError,
  deleteRequest,
  getJson,
  patchJson,
  postJson,
  putJson,
} from '../../shared/api/http';
import type { UserRole } from '../auth/auth.types';
import type {
  Course,
  CourseSubject,
  Subject,
  Vacancy,
} from '../catalog/catalog.types';
import type {
  ActivityApprovalStatus,
  ActivityLogRecord,
  ActivityType,
  Application,
  ApplicationStatus,
  MonitorRecord,
  MonitorStatus,
  OfficeHoursRecord,
  ReviewDecision,
  UserSummary,
  VacancyStatus,
  VacancyType,
  Weekday,
} from './monitoring.types';

async function list<T>(path: string, signal?: AbortSignal): Promise<T[]> {
  const result = await getJson<T[]>(path, signal);
  if (!Array.isArray(result)) {
    throw new ApiError(502, 'O backend retornou uma lista inválida.');
  }
  return result;
}

interface CursoDto {
  id: number;
  codigo: string;
  nome: string;
  setor: string | null;
}

interface MateriaDto {
  id: number;
  codigo: string;
  nome: string;
  departamento: string | null;
}

interface CursoMateriaDto {
  cursoId: number;
  materiaId: number;
}

interface VagaMonitoriaDto {
  id: number;
  materiaId: number;
  professorId: number;
  semestre: string;
  quantidadeVagas: number;
  tipoVaga: string;
  requisitos: string | null;
  descricao: string | null;
  status: string;
}

interface CandidaturaDto {
  id: number;
  vagaId: number;
  alunoId: number;
  notaDisciplina: number | null;
  cr: number | null;
  justificativa: string | null;
  status: ApplicationStatus;
  criadoEm: string | null;
}

interface MonitorDto {
  id: number;
  vagaId: number;
  alunoId: number;
  candidaturaId: number | null;
  cargaHorariaSemanal: number;
  status: MonitorStatus;
  dataInicio: string;
  dataFim: string | null;
}

interface HorarioAtendimentoDto {
  id: number;
  monitorId: number;
  diaSemana: Weekday;
  horaInicio: string;
  horaFim: string;
  localAtendimento: string;
  linkReuniao: string | null;
}

interface RegistroAtividadeDto {
  id: number;
  monitorId: number;
  dataAtividade: string;
  horaInicio: string;
  horaFim: string;
  tipoAtividade: ActivityType;
  descricao: string;
  quantidadeAlunosAtendidos: number;
  statusAprovacao: ActivityApprovalStatus;
  feedbackProfessor: string | null;
  criadoEm: string | null;
}

interface UsuarioDto {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: UserRole;
  matricula: string | null;
  cursoId: number | null;
  ativo: boolean;
  criadoEm: string | null;
}

const mapCourse = (dto: CursoDto): Course => ({
  id: dto.id,
  code: dto.codigo,
  name: dto.nome,
  sector: dto.setor,
});

const mapSubject = (dto: MateriaDto): Subject => ({
  id: dto.id,
  code: dto.codigo,
  name: dto.nome,
  department: dto.departamento,
});

const mapVacancy = (dto: VagaMonitoriaDto): Vacancy => ({
  id: dto.id,
  subjectId: dto.materiaId,
  professorId: dto.professorId,
  semester: dto.semestre,
  positions: dto.quantidadeVagas,
  type: dto.tipoVaga,
  requirements: dto.requisitos,
  description: dto.descricao,
  status: dto.status,
});

const mapApplication = (dto: CandidaturaDto): Application => ({
  id: dto.id,
  vacancyId: dto.vagaId,
  studentId: dto.alunoId,
  subjectGrade: dto.notaDisciplina,
  cr: dto.cr,
  justification: dto.justificativa,
  status: dto.status,
  createdAt: dto.criadoEm,
});

const mapMonitor = (dto: MonitorDto): MonitorRecord => ({
  id: dto.id,
  vacancyId: dto.vagaId,
  studentId: dto.alunoId,
  applicationId: dto.candidaturaId,
  weeklyHours: dto.cargaHorariaSemanal,
  status: dto.status,
  startDate: dto.dataInicio,
  endDate: dto.dataFim,
});

const mapOfficeHours = (dto: HorarioAtendimentoDto): OfficeHoursRecord => ({
  id: dto.id,
  monitorId: dto.monitorId,
  weekday: dto.diaSemana,
  startTime: dto.horaInicio,
  endTime: dto.horaFim,
  location: dto.localAtendimento,
  meetingLink: dto.linkReuniao,
});

const mapActivityLog = (dto: RegistroAtividadeDto): ActivityLogRecord => ({
  id: dto.id,
  monitorId: dto.monitorId,
  activityDate: dto.dataAtividade,
  startTime: dto.horaInicio,
  endTime: dto.horaFim,
  type: dto.tipoAtividade,
  description: dto.descricao,
  studentsHelped: dto.quantidadeAlunosAtendidos,
  approvalStatus: dto.statusAprovacao,
  professorFeedback: dto.feedbackProfessor,
  createdAt: dto.criadoEm,
});

const mapUser = (dto: UsuarioDto): UserSummary => ({
  id: dto.id,
  name: dto.nome,
  email: dto.email,
  role: dto.tipoUsuario,
  registration: dto.matricula,
  courseId: dto.cursoId,
  active: dto.ativo,
  createdAt: dto.criadoEm,
});

// Vagas de monitoria
export interface CreateVacancyPayload {
  materiaId: number;
  professorId: number;
  semestre: string;
  quantidadeVagas: number;
  tipoVaga: VacancyType;
  requisitos: string | null;
  descricao: string | null;
}

export interface UpdateVacancyPayload {
  semestre: string;
  quantidadeVagas: number;
  tipoVaga: VacancyType;
  requisitos: string | null;
  descricao: string | null;
  status: VacancyStatus;
}

export const createVacancy = (payload: CreateVacancyPayload) =>
  postJson<CreateVacancyPayload, VagaMonitoriaDto>(
    '/vagas-monitoria',
    payload,
  ).then(mapVacancy);

export const updateVacancy = (id: number, payload: UpdateVacancyPayload) =>
  putJson<UpdateVacancyPayload, VagaMonitoriaDto>(
    `/vagas-monitoria/${id}`,
    payload,
  ).then(mapVacancy);

export const patchVacancyStatus = (id: number, status: VacancyStatus) =>
  patchJson<{ status: VacancyStatus }, VagaMonitoriaDto>(
    `/vagas-monitoria/${id}`,
    { status },
  ).then(mapVacancy);

export const deleteVacancy = (id: number) =>
  deleteRequest(`/vagas-monitoria/${id}`);

// Candidaturas
export interface CreateApplicationPayload {
  vagaId: number;
  alunoId: number;
  notaDisciplina: number | null;
  cr: number | null;
  justificativa: string | null;
}

export const loadApplications = (signal?: AbortSignal) =>
  list<CandidaturaDto>('/candidaturas', signal).then((items) =>
    items.map(mapApplication),
  );

export const loadApplicationsByVacancy = (
  vacancyId: number,
  signal?: AbortSignal,
) =>
  list<CandidaturaDto>(`/candidaturas/vaga/${vacancyId}`, signal).then(
    (items) => items.map(mapApplication),
  );

export const loadApplicationsByStudent = (
  studentId: number,
  signal?: AbortSignal,
) =>
  list<CandidaturaDto>(`/candidaturas/aluno/${studentId}`, signal).then(
    (items) => items.map(mapApplication),
  );

export const createApplication = (payload: CreateApplicationPayload) =>
  postJson<CreateApplicationPayload, CandidaturaDto>(
    '/candidaturas',
    payload,
  ).then(mapApplication);

export const reviewApplicationStatus = (id: number, status: ReviewDecision) =>
  patchJson<{ status: ReviewDecision }, CandidaturaDto>(
    `/candidaturas/${id}/status`,
    { status },
  ).then(mapApplication);

export const updateApplicationStatus = (
  id: number,
  status: ApplicationStatus,
) =>
  patchJson<{ status: ApplicationStatus }, CandidaturaDto>(
    `/candidaturas/${id}/status`,
    { status },
  ).then(mapApplication);

export const deleteApplication = (id: number) =>
  deleteRequest(`/candidaturas/${id}`);

// Monitores
export interface CreateMonitorPayload {
  vagaId: number;
  alunoId: number;
  candidaturaId: number | null;
  cargaHorariaSemanal: number;
  dataInicio: string;
  dataFim: string | null;
}

export interface UpdateMonitorPayload {
  candidaturaId: number | null;
  cargaHorariaSemanal: number;
  status: MonitorStatus;
  dataInicio: string;
  dataFim: string | null;
}

export const loadMonitors = (signal?: AbortSignal) =>
  list<MonitorDto>('/monitores', signal).then((items) => items.map(mapMonitor));

export const loadMonitorsByStudent = (
  studentId: number,
  signal?: AbortSignal,
) =>
  list<MonitorDto>(`/monitores/aluno/${studentId}`, signal).then((items) =>
    items.map(mapMonitor),
  );

export const createMonitor = (payload: CreateMonitorPayload) =>
  postJson<CreateMonitorPayload, MonitorDto>('/monitores', payload).then(
    mapMonitor,
  );

export const updateMonitor = (id: number, payload: UpdateMonitorPayload) =>
  putJson<UpdateMonitorPayload, MonitorDto>(`/monitores/${id}`, payload).then(
    mapMonitor,
  );

export const deleteMonitor = (id: number) => deleteRequest(`/monitores/${id}`);

// Horários de atendimento
export interface CreateOfficeHoursPayload {
  monitorId: number;
  diaSemana: Weekday;
  horaInicio: string;
  horaFim: string;
  localAtendimento: string;
  linkReuniao: string | null;
}

export interface UpdateOfficeHoursPayload {
  diaSemana: Weekday;
  horaInicio: string;
  horaFim: string;
  localAtendimento: string;
  linkReuniao: string | null;
}

export const loadOfficeHours = (signal?: AbortSignal) =>
  list<HorarioAtendimentoDto>('/horarios-atendimento', signal).then((items) =>
    items.map(mapOfficeHours),
  );

export const createOfficeHours = (payload: CreateOfficeHoursPayload) =>
  postJson<CreateOfficeHoursPayload, HorarioAtendimentoDto>(
    '/horarios-atendimento',
    payload,
  ).then(mapOfficeHours);

export const updateOfficeHours = (
  id: number,
  payload: UpdateOfficeHoursPayload,
) =>
  putJson<UpdateOfficeHoursPayload, HorarioAtendimentoDto>(
    `/horarios-atendimento/${id}`,
    payload,
  ).then(mapOfficeHours);

export const deleteOfficeHours = (id: number) =>
  deleteRequest(`/horarios-atendimento/${id}`);

// Registros de atividades
export interface CreateActivityLogPayload {
  monitorId: number;
  dataAtividade: string;
  horaInicio: string;
  horaFim: string;
  tipoAtividade: ActivityType;
  descricao: string;
  quantidadeAlunosAtendidos: number;
}

export interface ApproveActivityLogPayload {
  statusAprovacao: ActivityApprovalStatus;
  feedbackProfessor: string | null;
}

export const loadActivityLogs = (signal?: AbortSignal) =>
  list<RegistroAtividadeDto>('/registros-atividades', signal).then((items) =>
    items.map(mapActivityLog),
  );

export const loadActivityLogsByMonitor = (
  monitorId: number,
  signal?: AbortSignal,
) =>
  list<RegistroAtividadeDto>(
    `/registros-atividades/monitor/${monitorId}`,
    signal,
  ).then((items) => items.map(mapActivityLog));

export const createActivityLog = (payload: CreateActivityLogPayload) =>
  postJson<CreateActivityLogPayload, RegistroAtividadeDto>(
    '/registros-atividades',
    payload,
  ).then(mapActivityLog);

export const approveActivityLog = (
  id: number,
  payload: ApproveActivityLogPayload,
) =>
  patchJson<ApproveActivityLogPayload, RegistroAtividadeDto>(
    `/registros-atividades/${id}/aprovacao`,
    payload,
  ).then(mapActivityLog);

export const deleteActivityLog = (id: number) =>
  deleteRequest(`/registros-atividades/${id}`);

// Admin — Cursos, Matérias, Vínculos e Usuários
export interface CoursePayload {
  codigo: string;
  nome: string;
  setor: string | null;
}

export interface SubjectPayload {
  codigo: string;
  nome: string;
  departamento: string;
}

export interface CreateUserPayload {
  nome: string;
  email: string;
  tipoUsuario: UserRole;
  matricula: string | null;
  cursoId: number | null;
  senha: string;
}

export interface UpdateUserPayload {
  nome: string;
  email: string;
  tipoUsuario: UserRole;
  matricula: string | null;
  cursoId: number | null;
  ativo: boolean;
  senha?: string;
}

export const createCourse = (payload: CoursePayload) =>
  postJson<CoursePayload, CursoDto>('/cursos', payload).then(mapCourse);

export const updateCourse = (id: number, payload: CoursePayload) =>
  putJson<CoursePayload, CursoDto>(`/cursos/${id}`, payload).then(mapCourse);

export const deleteCourse = (id: number) => deleteRequest(`/cursos/${id}`);

export const createSubject = (payload: SubjectPayload) =>
  postJson<SubjectPayload, MateriaDto>('/materias', payload).then(mapSubject);

export const updateSubject = (id: number, payload: SubjectPayload) =>
  putJson<SubjectPayload, MateriaDto>(`/materias/${id}`, payload).then(
    mapSubject,
  );

export const deleteSubject = (id: number) => deleteRequest(`/materias/${id}`);

export const linkCourseSubject = (courseId: number, subjectId: number) =>
  postJson<Record<string, never>, CursoMateriaDto>(
    `/cursos-materias/${courseId}/${subjectId}`,
    {},
  ).then(
    (dto): CourseSubject => ({
      courseId: dto.cursoId,
      subjectId: dto.materiaId,
    }),
  );

export const unlinkCourseSubject = (courseId: number, subjectId: number) =>
  deleteRequest(`/cursos-materias/${courseId}/${subjectId}`);

export const loadUsers = (signal?: AbortSignal) =>
  list<UsuarioDto>('/usuarios', signal).then((items) => items.map(mapUser));

export const createUser = (payload: CreateUserPayload) =>
  postJson<CreateUserPayload, UsuarioDto>('/usuarios', payload).then(mapUser);

export const updateUser = (id: number, payload: UpdateUserPayload) =>
  putJson<UpdateUserPayload, UsuarioDto>(`/usuarios/${id}`, payload).then(
    mapUser,
  );

export const deleteUser = (id: number) => deleteRequest(`/usuarios/${id}`);
