import { ApiError, getJson } from '../../shared/api/http';
import type { Course, Subject, CourseSubject, Vacancy } from './catalog.types';

async function list<T>(path: string, signal: AbortSignal): Promise<T[]> {
  const result = await getJson<T[]>(path, signal);
  if (!Array.isArray(result))
    throw new ApiError(502, 'O backend retornou uma lista inválida.');
  return result;
}

export const loadCourses = (signal: AbortSignal) =>
  list<Course>('/courses', signal);
export const loadSubjects = (signal: AbortSignal) =>
  list<Subject>('/subjects', signal);
export const loadVacancies = (signal: AbortSignal) =>
  list<Vacancy>('/monitoring-vacancies', signal);
export const loadRelations = (signal: AbortSignal) =>
  list<CourseSubject>('/course-subjects', signal);
export const loadVacancy = (id: string, signal: AbortSignal) =>
  getJson<Vacancy>('/monitoring-vacancies/' + encodeURIComponent(id), signal);
