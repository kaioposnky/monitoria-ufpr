import { OfficeHoursForm } from '../../components/OfficeHoursForm/OfficeHoursForm';
import { PageHeader } from '../../components/PageHeader/PageHeader';

export function OfficeHoursPage() {
  return (
    <>
      <PageHeader
        title="Horários e disponibilidade"
        description="Consulte a situação da consulta de horários e monte um rascunho de disponibilidade do monitor."
      />
      <section className="panel" aria-labelledby="office-hours-query-title">
        <h2 id="office-hours-query-title">Consulta de horários indisponível</h2>
        <p>
          O backend atual expõe apenas a consulta do catálogo acadêmico. Não há
          endpoint para listar horários de atendimento ou disponibilidades já
          cadastradas, portanto nenhuma grade de horários é exibida nesta tela.
        </p>
      </section>
      <OfficeHoursForm />
    </>
  );
}
