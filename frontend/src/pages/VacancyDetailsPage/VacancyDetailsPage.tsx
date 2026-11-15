import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { QueryResult } from '../../components/QueryResult/QueryResult';
import { VacancyDetails } from '../../components/VacancyDetails/VacancyDetails';
import {
  loadSubjects,
  loadTopics,
  loadVacancy,
} from '../../features/catalog/catalog.api';
import { useQuery } from '../../shared/useQuery';

export function VacancyDetailsPage() {
  const { id = '' } = useParams();
  const loadSelectedVacancy = useCallback(
    (signal: AbortSignal) => loadVacancy(id, signal),
    [id],
  );
  const loadCatalog = useCallback(async (signal: AbortSignal) => {
    const [subjects, topics] = await Promise.all([
      loadSubjects(signal),
      loadTopics(signal),
    ]);
    return { subjects, topics };
  }, []);
  const vacancyQuery = useQuery(loadSelectedVacancy);
  const catalogQuery = useQuery(loadCatalog);

  return (
    <>
      <PageHeader
        title="Detalhes da vaga"
        description="Requisitos, modalidade e informações da monitoria."
      >
        <Link to="/monitoring-vacancies">← Voltar às vagas</Link>
      </PageHeader>
      <QueryResult {...vacancyQuery}>
        {(vacancy) => (
          <QueryResult {...catalogQuery}>
            {({ subjects, topics }) => {
              const subjectsById = new Map(
                subjects.map((subject) => [subject.id, subject] as const),
              );
              const disciplineTopics = topics.filter(
                (topic) => topic.disciplineId === vacancy.subjectId,
              );
              return (
                <VacancyDetails
                  vacancy={vacancy}
                  subject={subjectsById.get(vacancy.subjectId) ?? null}
                  topics={disciplineTopics}
                />
              );
            }}
          </QueryResult>
        )}
      </QueryResult>
    </>
  );
}
