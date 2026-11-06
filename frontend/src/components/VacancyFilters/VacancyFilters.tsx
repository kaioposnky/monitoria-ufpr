import { FormField } from '../FormField/FormField';
import {
  vacancyStatusOptions,
  vacancyTypeOptions,
} from '../../features/catalog/catalog.labels';

type Props = {
  search: string;
  type: string;
  status: string;
  total: number;
  matched: number;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
};

export function VacancyFilters({
  search,
  type,
  status,
  total,
  matched,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onClear,
}: Props) {
  const hasFilters = search.trim() !== '' || type !== '' || status !== '';

  return (
    <section className="toolbar" aria-label="Filtros de vagas">
      <FormField label="Disciplina ou código">
        <input
          type="search"
          value={search}
          placeholder="Ex.: Cálculo 1 ou CM041"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </FormField>
      <FormField label="Modalidade">
        <select
          value={type}
          onChange={(event) => onTypeChange(event.target.value)}
        >
          <option value="">Todas as modalidades</option>
          {vacancyTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Situação">
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="">Todas as situações</option>
          {vacancyStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>
      <div className="form-actions">
        <button
          type="button"
          className="secondary"
          onClick={onClear}
          disabled={!hasFilters}
        >
          Limpar filtros
        </button>
        <p className="muted" role="status" aria-live="polite">
          {matched} de {total} {total === 1 ? 'vaga' : 'vagas'}
        </p>
      </div>
    </section>
  );
}
