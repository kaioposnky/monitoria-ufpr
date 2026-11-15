import { Link } from 'react-router-dom';
import { catalogLabel } from '../../features/catalog/catalog.labels';
import type {
  Subject,
  Topic,
  Vacancy,
} from '../../features/catalog/catalog.types';
import { formatDateBr } from '../../features/monitoring/monitoring.rules';

type Props = {
  vacancy: Vacancy;
  subject: Subject | null;
  topics?: Topic[];
};

export function VacancyDetails({ vacancy, subject, topics = [] }: Props) {
  const isOpen = vacancy.status === 'ABERTA';

  return (
    <article className="panel">
      <span className="badge">{catalogLabel(vacancy.status)}</span>
      <h2>{subject?.name ?? 'Disciplina #' + vacancy.subjectId}</h2>
      {subject && (
        <p className="muted">
          Código {subject.code}
          {subject.department ? ` · ${subject.department}` : ''}
        </p>
      )}
      <dl>
        <dt>Semestre</dt>
        <dd>{vacancy.semester}</dd>
        <dt>Modalidade</dt>
        <dd>{catalogLabel(vacancy.type)}</dd>
        <dt>Quantidade de vagas</dt>
        <dd>{vacancy.positions}</dd>
        {(vacancy.openingDate || vacancy.closingDate) && (
          <>
            <dt>Período de inscrições</dt>
            <dd>
              {vacancy.openingDate
                ? `Abertura: ${formatDateBr(vacancy.openingDate)}`
                : 'Abertura imediata'}
              {' · '}
              {vacancy.closingDate
                ? `Encerramento: ${formatDateBr(vacancy.closingDate)}`
                : 'Sem data limite'}
            </dd>
          </>
        )}
        <dt>Professor responsável</dt>
        <dd>Identificador {vacancy.professorId}</dd>
        <dt>Requisitos</dt>
        <dd className="multiline">
          {vacancy.requirements || 'Não informados.'}
        </dd>
        <dt>Descrição</dt>
        <dd className="multiline">{vacancy.description || 'Não informada.'}</dd>
        <dt>Matérias da disciplina</dt>
        <dd>
          {topics.length > 0 ? (
            <ul>
              {topics.map((topic) => (
                <li key={topic.id}>
                  <strong>{topic.name}</strong>
                  {topic.description ? ` — ${topic.description}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            'Nenhuma matéria cadastrada para esta disciplina.'
          )}
        </dd>
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
