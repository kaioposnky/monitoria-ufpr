import { EmptyState } from '../../components/EmptyState/EmptyState';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { QueryResult } from '../../components/QueryResult/QueryResult';
import { VacancyForm } from '../../components/VacancyForm/VacancyForm';
import { loadSubjects } from '../../features/catalog/catalog.api';
import { useQuery } from '../../shared/useQuery';

export function NewVacancyPage() {
  const query = useQuery(loadSubjects);
  return (
    <>
      <PageHeader
        title="Cadastrar vaga de monitoria"
        description="Monte o rascunho de uma vaga usando as matérias reais do catálogo. O cadastro depende de integração futura."
      />
      <QueryResult state={query.state} retry={query.retry}>
        {(subjects) =>
          subjects.length === 0 ? (
            <EmptyState
              title="Catálogo de matérias vazio"
              description="Não há matérias disponíveis para vincular à vaga. O cadastro fica indisponível até que o catálogo seja preenchido."
            />
          ) : (
            <VacancyForm subjects={subjects} />
          )
        }
      </QueryResult>
    </>
  );
}
