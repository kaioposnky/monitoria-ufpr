import { PageHeader } from '../../components/PageHeader/PageHeader';
import { NavigationCard } from '../../components/NavigationCard/NavigationCard';
export function ManagementPage() {
  return (
    <>
      <PageHeader
        title="Gestão de monitorias"
        description="Organize vagas e prepare a análise das candidaturas. As operações abaixo ainda dependem de integração."
      />
      <p className="notice">
        Esta área não possui autenticação ou autorização. A navegação não
        concede permissões; o backend deverá validar o responsável por cada
        operação.
      </p>
      <div className="grid">
        <NavigationCard
          to="/management/vacancies/new"
          title="Preparar vaga"
          description="Disciplina, semestre, modalidade e requisitos."
          status="RF04 · Rascunho"
        />
        <NavigationCard
          to="/management/monitors/review"
          title="Revisar candidatura"
          description="Prepare uma decisão para análise pelo professor responsável."
          status="RF05 · Rascunho"
        />
        <NavigationCard
          to="/office-hours"
          title="Disponibilidade"
          description="Prepare os períodos de atendimento do monitor."
          status="RF06 · Rascunho"
        />
      </div>
    </>
  );
}
