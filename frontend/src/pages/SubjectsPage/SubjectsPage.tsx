import { EmptyState } from '../../components/EmptyState/EmptyState';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { QueryResult } from '../../components/QueryResult/QueryResult';
import { loadSubjects } from '../../features/catalog/catalog.api';
import { useQuery } from '../../shared/useQuery';

export function SubjectsPage() {
  const query = useQuery(loadSubjects);

  return (
    <>
      <PageHeader
        title="Matérias"
        description="Disciplinas e departamentos do catálogo acadêmico."
      />
      <QueryResult {...query}>
        {(subjects) =>
          subjects.length ? (
            <div className="table-wrap">
              <table>
                <caption>Matérias cadastradas</caption>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Departamento</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id}>
                      <td>{subject.code}</td>
                      <td>{subject.name}</td>
                      <td>{subject.department ?? 'Não informado'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Nenhuma matéria cadastrada"
              description="O catálogo acadêmico ainda não possui matérias retornadas pelo backend."
            />
          )
        }
      </QueryResult>
    </>
  );
}
