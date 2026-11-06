import { EmptyState } from '../../components/EmptyState/EmptyState';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { QueryResult } from '../../components/QueryResult/QueryResult';
import {
  loadCourses,
  loadRelations,
  loadSubjects,
} from '../../features/catalog/catalog.api';
import { useQuery } from '../../shared/useQuery';

async function loadCourseSubjects(signal: AbortSignal) {
  const [courses, subjects, relations] = await Promise.all([
    loadCourses(signal),
    loadSubjects(signal),
    loadRelations(signal),
  ]);
  return { courses, subjects, relations };
}

export function CourseSubjectsPage() {
  const query = useQuery(loadCourseSubjects);

  return (
    <>
      <PageHeader
        title="Vínculos curso–matéria"
        description="Disciplinas associadas a cada curso."
      />
      <QueryResult {...query}>
        {({ courses, subjects, relations }) => {
          const coursesById = new Map(
            courses.map((course) => [course.id, course] as const),
          );
          const subjectsById = new Map(
            subjects.map((subject) => [subject.id, subject] as const),
          );

          return relations.length ? (
            <div className="table-wrap">
              <table>
                <caption>Vínculos cadastrados</caption>
                <thead>
                  <tr>
                    <th>Curso</th>
                    <th>Matéria</th>
                  </tr>
                </thead>
                <tbody>
                  {relations.map((relation) => {
                    const course = coursesById.get(relation.courseId);
                    const subject = subjectsById.get(relation.subjectId);
                    return (
                      <tr key={relation.courseId + ':' + relation.subjectId}>
                        <td>{course?.name ?? 'Curso #' + relation.courseId}</td>
                        <td>
                          {subject?.name ?? 'Matéria #' + relation.subjectId}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Nenhum vínculo cadastrado"
              description="Ainda não há relações entre cursos e matérias no catálogo."
            />
          );
        }}
      </QueryResult>
    </>
  );
}
