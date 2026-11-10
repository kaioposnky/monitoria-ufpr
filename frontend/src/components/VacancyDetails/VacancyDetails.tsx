import { Link } from 'react-router-dom';
import { catalogLabel } from '../../features/catalog/catalog.labels';
import type { Subject, Vacancy } from '../../features/catalog/catalog.types';

type Props = {
  vacancy: Vacancy;
  subject: Subject | null;
};

export function VacancyDetails({ vacancy, subject }: Props) {
  const isOpen = vacancy.status === 'ABERTA';

  return (
    <article className="panel">
      <span className="badge">{catalogLabel(vacancy.status)}</span>
      <h2>{subject?.name ?? 'Matéria #' + vacancy.subjectId}</h2>
      {subject && <p className="muted">Código {subject.code}</p>}
      <dl>
        <dt>Semestre</dt>
        <dd>{vacancy.semester}</dd>
        <dt>Modalidade</dt>
        <dd>{catalogLabel(vacancy.type)}</dd>
        <dt>Quantidade de vagas</dt>
        <dd>{vacancy.positions}</dd>
        <dt>Professor responsável</dt>
        <dd>Identificador {vacancy.professorId}</dd>
        <dt>Requisitos</dt>
        <dd className="multiline">
          {vacancy.requirements || 'Não informados.'}
        </dd>
        <dt>Descrição</dt>
        <dd className="multiline">{vacancy.description || 'Não informada.'}</dd>
      </dl>
      <div className="form-actions">
        {isOpen && (
          <Link
            className="primary"
            to={'/applications/new?vacancyId=' + vacancy.id}
          >
            Candidatar-se a esta vaga
          </Link>
        )}
        <Link className="button-link" to="/office-hours">
          Consultar horários de atendimento
        </Link>
      </div>
      {!isOpen && (
        <p className="muted">Esta vaga não está aberta para candidaturas.</p>
      )}
    </article>
  );
}
