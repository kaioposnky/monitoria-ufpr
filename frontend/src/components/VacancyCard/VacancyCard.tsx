import { Link } from 'react-router-dom';
import { catalogLabel } from '../../features/catalog/catalog.labels';
import type { Subject, Vacancy } from '../../features/catalog/catalog.types';
import { formatDateBr } from '../../features/monitoring/monitoring.rules';

type Props = {
  vacancy: Vacancy;
  subject: Subject | null;
};

export function VacancyCard({ vacancy, subject }: Props) {
  return (
    <article className="panel">
      <span className="badge">{catalogLabel(vacancy.status)}</span>
      <h2>{subject?.name ?? 'Matéria #' + vacancy.subjectId}</h2>
      <p className="muted">
        {subject ? subject.code + ' · ' : ''}
        {vacancy.semester} · {catalogLabel(vacancy.type)}
      </p>
      <p>
        {vacancy.positions}{' '}
        {vacancy.positions === 1 ? 'vaga disponível' : 'vagas disponíveis'}
      </p>
      {(vacancy.openingDate || vacancy.closingDate) && (
        <p className="muted">
          Inscrições:{' '}
          {vacancy.openingDate ? formatDateBr(vacancy.openingDate) : 'imediata'}
          {' — '}
          {vacancy.closingDate
            ? formatDateBr(vacancy.closingDate)
            : 'sem prazo'}
        </p>
      )}
      <Link to={'/monitoring-vacancies/' + vacancy.id}>
        Ver detalhes da vaga
      </Link>
    </article>
  );
}
