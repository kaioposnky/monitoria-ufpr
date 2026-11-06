import { EmptyState } from '../../components/EmptyState/EmptyState';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { QueryResult } from '../../components/QueryResult/QueryResult';
import { loadCourses } from '../../features/catalog/catalog.api';
import { useQuery } from '../../shared/useQuery';

export function CoursesPage() {
  const query = useQuery(loadCourses);

  return (
    <>
      <PageHeader
        title="Cursos"
        description="Graduações atendidas pelo programa de monitoria."
      />
      <QueryResult {...query}>
        {(courses) =>
          courses.length ? (
            <div className="table-wrap">
              <table>
                <caption>Cursos cadastrados</caption>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Setor</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>{course.code}</td>
                      <td>{course.name}</td>
                      <td>{course.sector ?? 'Não informado'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Nenhum curso cadastrado"
              description="O catálogo acadêmico ainda não possui cursos retornados pelo backend."
            />
          )
        }
      </QueryResult>
    </>
  );
}
