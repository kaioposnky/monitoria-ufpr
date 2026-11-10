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
import { VACANCY_STATUS_LABELS } from '../../features/monitoring/monitoring.rules';
import type { VacancyStatus } from '../../features/monitoring/monitoring.types';
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
          const openVacancies = vacancies.filter(
            (vacancy) => vacancy.status === 'ABERTA',
          );
          const requestedVacancy =
            requestedVacancyId === undefined
              ? undefined
              : vacancies.find((vacancy) => vacancy.id === requestedVacancyId);

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
          } else if (requestedVacancy && requestedVacancy.status !== 'ABERTA') {
            const status =
              VACANCY_STATUS_LABELS[requestedVacancy.status as VacancyStatus] ||
              requestedVacancy.status;
            unavailable = {
              title: 'Vaga indisponível para candidatura',
              description:
                'A vaga #' +
                requestedVacancy.id +
                ' está com status ' +
                status +
                '. Somente vagas com status ABERTA aceitam candidatura.',
            };
          } else if (openVacancies.length === 0) {
            unavailable = {
              title: 'Nenhuma vaga aberta',
              description:
                'O catálogo não possui vagas com status ABERTA. A candidatura fica indisponível até que uma vaga aberta seja cadastrada.',
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
