import { ApiError, getJson } from '../../shared/api/http';
import type { Course, Subject, CourseSubject, Vacancy } from './catalog.types';

async function list<T>(path: string, signal: AbortSignal): Promise<T[]> {
  const result = await getJson<T[]>(path, signal);
  if (!Array.isArray(result))
    throw new ApiError(502, 'O backend retornou uma lista inválida.');
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
  dataAbertura?: string | null;
  dataEncerramento?: string | null;
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

const mapRelation = (dto: CursoMateriaDto): CourseSubject => ({
  courseId: dto.cursoId,
  subjectId: dto.materiaId,
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
  openingDate: dto.dataAbertura ?? null,
  closingDate: dto.dataEncerramento ?? null,
});

export const loadCourses = (signal: AbortSignal) =>
  list<CursoDto>('/cursos', signal).then((items) => items.map(mapCourse));
export const loadSubjects = (signal: AbortSignal) =>
  list<MateriaDto>('/materias', signal).then((items) => items.map(mapSubject));
export const loadVacancies = (signal: AbortSignal) =>
  list<VagaMonitoriaDto>('/vagas-monitoria', signal).then((items) =>
    items.map(mapVacancy),
  );
export const loadRelations = (signal: AbortSignal) =>
  list<CursoMateriaDto>('/cursos-materias', signal).then((items) =>
    items.map(mapRelation),
  );
export const loadVacancy = (id: string, signal: AbortSignal) =>
  getJson<VagaMonitoriaDto>(
    '/vagas-monitoria/' + encodeURIComponent(id),
    signal,
  ).then(mapVacancy);
