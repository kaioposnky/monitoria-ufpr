export interface Course {
  id: number;
  code: string;
  name: string;
  sector: string | null;
}
export interface Subject {
  id: number;
  code: string;
  name: string;
  department: string | null;
}
export interface CourseSubject {
  courseId: number;
  subjectId: number;
}
export interface Vacancy {
  id: number;
  subjectId: number;
  professorId: number;
  semester: string;
  positions: number;
  type: string;
  requirements: string | null;
  description: string | null;
  status: string;
  openingDate: string | null;
  closingDate: string | null;
}
