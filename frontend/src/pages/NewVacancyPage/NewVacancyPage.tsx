import { useCallback } from 'react';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { QueryResult } from '../../components/QueryResult/QueryResult';
import { VacancyForm } from '../../components/VacancyForm/VacancyForm';
import { useAuth } from '../../features/auth/AuthContext';
import { loadSubjects } from '../../features/catalog/catalog.api';
import { loadUsers } from '../../features/monitoring/monitoring.api';
import { useQuery } from '../../shared/useQuery';

export function NewVacancyPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const loadData = useCallback(
    async (signal: AbortSignal) => {
      const [subjects, users] = await Promise.all([
        loadSubjects(signal),
        isAdmin ? loadUsers(signal) : Promise.resolve([]),
      ]);
      return {
        subjects,
        professors: users.filter((u) => u.role === 'PROFESSOR' && u.active),
      };
    },
    [isAdmin],
  );

  const query = useQuery(loadData);

  return (
    <>
      <PageHeader
        title="Cadastrar vaga de monitoria"
        description="Crie uma nova vaga vinculada a uma disciplina do catálogo acadêmico."
      />
      <QueryResult state={query.state} retry={query.retry}>
        {({ subjects, professors }) =>
          subjects.length === 0 ? (
            <EmptyState
              title="Catálogo de disciplinas vazio"
              description="Não há disciplinas disponíveis para vincular à vaga. Cadastre uma disciplina na área de Administração antes de continuar."
            />
          ) : (
            <VacancyForm subjects={subjects} professors={professors} />
          )
        }
      </QueryResult>
    </>
  );
}
