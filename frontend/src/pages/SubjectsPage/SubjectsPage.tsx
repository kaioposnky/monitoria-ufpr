import { useCallback } from 'react';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { QueryResult } from '../../components/QueryResult/QueryResult';
import { loadSubjects, loadTopics } from '../../features/catalog/catalog.api';
import { useQuery } from '../../shared/useQuery';

export function SubjectsPage() {
  const loadCatalog = useCallback(async (signal: AbortSignal) => {
    const [subjects, topics] = await Promise.all([
      loadSubjects(signal),
      loadTopics(signal),
    ]);
    return { subjects, topics };
  }, []);
  const query = useQuery(loadCatalog);

  return (
    <>
      <PageHeader
        title="Disciplinas e matérias"
        description="Disciplinas do catálogo acadêmico e suas matérias/conteúdos vinculados (1:N)."
      />
      <QueryResult {...query}>
        {({ subjects, topics }) => {
          const topicsByDiscipline = new Map<number, typeof topics>();
          for (const topic of topics) {
            const existing = topicsByDiscipline.get(topic.disciplineId) ?? [];
            existing.push(topic);
            topicsByDiscipline.set(topic.disciplineId, existing);
          }

          return subjects.length ? (
            <div className="table-wrap">
              <table>
                <caption>Disciplinas cadastradas e matérias vinculadas</caption>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Disciplina</th>
                    <th>Departamento</th>
                    <th>Matérias (1:N)</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => {
                    const list = topicsByDiscipline.get(subject.id) ?? [];
                    return (
                      <tr key={subject.id}>
                        <td>{subject.code}</td>
                        <td>{subject.name}</td>
                        <td>{subject.department ?? 'Não informado'}</td>
                        <td>
                          {list.length ? (
                            <ul>
                              {list.map((topic) => (
                                <li key={topic.id}>
                                  <strong>{topic.name}</strong>
                                  {topic.description
                                    ? ` — ${topic.description}`
                                    : ''}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="muted">
                              Nenhuma matéria cadastrada
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Nenhuma disciplina cadastrada"
              description="O catálogo acadêmico ainda não possui disciplinas retornadas pelo backend."
            />
          );
        }}
      </QueryResult>
    </>
  );
}
