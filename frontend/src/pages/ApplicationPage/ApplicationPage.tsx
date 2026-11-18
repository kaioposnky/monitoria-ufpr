import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApplicationForm } from '../../components/ApplicationForm/ApplicationForm';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { QueryResult } from '../../components/QueryResult/QueryResult';
import { useAuth } from '../../features/auth/AuthContext';
import {
  loadSubjects,
  loadVacancies,
} from '../../features/catalog/catalog.api';
import { loadUsers } from '../../features/monitoring/monitoring.api';
import { applicationUnavailableReason } from '../../features/monitoring/monitoring.rules';
import { useQuery } from '../../shared/useQuery';

export function ApplicationPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const loadApplicationCatalog = useCallback(
    async (signal: AbortSignal) => {
      const [vacancies, subjects, users] = await Promise.all([
        loadVacancies(signal),
        loadSubjects(signal),
        isAdmin ? loadUsers(signal) : Promise.resolve([]),
      ]);
      return {
        vacancies,
        subjects,
        students: users.filter((u) => u.role === 'ALUNO' && u.active),
      };
    },
    [isAdmin],
  );

  const query = useQuery(loadApplicationCatalog);
  const [searchParams, setSearchParams] = useSearchParams();
  const rawVacancyId =
    searchParams.get('vaga') ?? searchParams.get('vacancyId');
  const parsedVacancyId =
    rawVacancyId !== null && /^[1-9]\d*$/.test(rawVacancyId.trim())
      ? Number(rawVacancyId)
      : undefined;
  const requestedVacancyId =
    parsedVacancyId !== undefined && Number.isSafeInteger(parsedVacancyId)
      ? parsedVacancyId
      : undefined;

  return (
    <>
      <PageHeader
        title="Candidatura a monitoria"
        description="Escolha uma vaga aberta do catálogo e envie sua candidatura diretamente para análise."
      />
      <QueryResult state={query.state} retry={query.retry}>
        {({ vacancies, subjects, students }) => {
          const now = new Date();
          const openVacancies = vacancies.filter(
            (vacancy) => applicationUnavailableReason(vacancy, now) === null,
          );
          const requestedVacancy =
            requestedVacancyId === undefined
              ? undefined
              : vacancies.find((vacancy) => vacancy.id === requestedVacancyId);
          const unavailableReason = requestedVacancy
            ? applicationUnavailableReason(requestedVacancy, now)
            : null;

          let unavailable: { title: string; description: string } | undefined;
          if (rawVacancyId !== null && requestedVacancyId === undefined) {
            unavailable = {
              title: 'Vaga inválida no link',
              description:
                'O identificador de vaga informado não é válido. Escolha uma vaga aberta do catálogo para continuar.',
            };
          } else if (rawVacancyId !== null && !requestedVacancy) {
            unavailable = {
              title: 'Vaga não encontrada',
              description:
                'A vaga indicada no link não existe no catálogo consultado. Escolha uma vaga aberta para continuar.',
            };
          } else if (unavailableReason) {
            unavailable = {
              title: 'Vaga indisponível para candidatura',
              description: unavailableReason,
            };
          } else if (openVacancies.length === 0) {
            unavailable = {
              title: 'Nenhuma vaga com inscrições abertas',
              description: 'O catálogo não possui vagas aceitando candidaturas no momento.',
            };
          }

          if (unavailable) {
            return (
              <>
                <EmptyState
                  title={unavailable.title}
                  description={unavailable.description}
                />
                {openVacancies.length > 0 && (
                  <div className="form-actions">
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => setSearchParams({})}
                    >
                      Escolher uma vaga aberta
                    </button>
                  </div>
                )}
              </>
            );
          }

          return (
            <ApplicationForm
              key={requestedVacancyId ?? 'sem-vaga'}
              vacancies={openVacancies}
              subjects={subjects}
              students={students}
              initialVacancyId={requestedVacancyId}
            />
          );
        }}
      </QueryResult>
    </>
  );
}
