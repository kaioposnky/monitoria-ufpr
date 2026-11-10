import { useCallback } from 'react';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { MonitorReviewForm } from '../../components/MonitorReviewForm/MonitorReviewForm';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { QueryResult } from '../../components/QueryResult/QueryResult';
import { useAuth } from '../../features/auth/AuthContext';
import {
  loadSubjects,
  loadVacancies,
} from '../../features/catalog/catalog.api';
import {
  loadApplications,
  loadUsers,
} from '../../features/monitoring/monitoring.api';
import { useQuery } from '../../shared/useQuery';

export function MonitorReviewPage() {
  const { user } = useAuth();

  const loadReviewData = useCallback(async (signal: AbortSignal) => {
    const [applications, vacancies, subjects, users] = await Promise.all([
      loadApplications(signal),
      loadVacancies(signal),
      loadSubjects(signal),
      loadUsers(signal),
    ]);
    return { applications, vacancies, subjects, users };
  }, []);

  const query = useQuery(loadReviewData);

  return (
    <>
      <PageHeader
        title="Revisar candidaturas"
        description="Aprove ou reprove candidaturas enviadas para suas vagas de monitoria."
      />
      <QueryResult state={query.state} retry={query.retry}>
        {({ applications, vacancies, subjects, users }) => {
          const allowedVacancyIds =
            user?.role === 'PROFESSOR'
              ? new Set(
                  vacancies
                    .filter((v) => v.professorId === user.id)
                    .map((v) => v.id),
                )
              : null;

          const visibleApplications = allowedVacancyIds
            ? applications.filter((a) => allowedVacancyIds.has(a.vacancyId))
            : applications;

          if (visibleApplications.length === 0) {
            return (
              <EmptyState
                title="Nenhuma candidatura disponível para revisão"
                description="Ainda não há candidaturas vinculadas às vagas sob sua responsabilidade."
              />
            );
          }

          return (
            <MonitorReviewForm
              applications={visibleApplications}
              vacancies={vacancies}
              subjects={subjects}
              users={users}
              onUpdated={() => query.retry()}
            />
          );
        }}
      </QueryResult>
    </>
  );
}
