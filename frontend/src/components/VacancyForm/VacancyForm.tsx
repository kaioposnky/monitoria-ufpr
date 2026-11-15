import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import type { Subject, Vacancy } from '../../features/catalog/catalog.types';
import { createVacancy } from '../../features/monitoring/monitoring.api';
import {
  formatSubjectLabel,
  isPositiveInteger,
  isSemester,
  isValidDateRange,
  VACANCY_TYPE_LABELS,
} from '../../features/monitoring/monitoring.rules';
import {
  VACANCY_TYPES,
  type UserSummary,
  type VacancyDraft,
} from '../../features/monitoring/monitoring.types';
import { errorMessage } from '../../shared/api/http';
import { FormField } from '../FormField/FormField';

type Props = {
  subjects: Subject[];
  professors?: UserSummary[];
  onCreated?: (vacancy: Vacancy) => void;
};

type Errors = Partial<Record<keyof VacancyDraft, string>>;

const emptyDraft: VacancyDraft = {
  subjectId: '',
  professorId: '',
  semester: '',
  positions: '',
  type: '',
  openingDate: '',
  closingDate: '',
  requirements: '',
  description: '',
};

export function VacancyForm({ subjects, professors = [], onCreated }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [draft, setDraft] = useState<VacancyDraft>(emptyDraft);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdVacancy, setCreatedVacancy] = useState<Vacancy | null>(null);

  const effectiveProfessorId = isAdmin
    ? draft.professorId
    : user
      ? String(user.id)
      : '';

  function update<K extends keyof VacancyDraft>(
    field: K,
    value: VacancyDraft[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSubmitError(null);
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validate(values: VacancyDraft): Errors {
    const next: Errors = {};
    if (!subjects.some((subject) => String(subject.id) === values.subjectId)) {
      next.subjectId = 'Selecione uma disciplina do catálogo.';
    }
    if (!isPositiveInteger(effectiveProfessorId)) {
      next.professorId = 'Selecione o professor responsável pela vaga.';
    }
    if (!isSemester(values.semester)) {
      next.semester = 'Informe o semestre no formato AAAA/S, como 2026/2.';
    }
    if (!isPositiveInteger(values.positions)) {
      next.positions = 'Informe uma quantidade inteira e positiva de vagas.';
    }
    if (!VACANCY_TYPES.some((type) => type === values.type)) {
      next.type = 'Selecione o tipo da vaga.';
    }
    if (!isValidDateRange(values.openingDate, values.closingDate)) {
      next.closingDate =
        'A data de encerramento deve ser igual ou posterior à data de abertura.';
    }
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate(draft);
    setErrors(next);
    if (Object.keys(next).length > 0 || !draft.type) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createVacancy({
        disciplinaId: Number(draft.subjectId),
        professorId: Number(effectiveProfessorId),
        semestre: draft.semester.trim(),
        quantidadeVagas: Number(draft.positions),
        tipoVaga: draft.type,
        requisitos: draft.requirements.trim() || null,
        descricao: draft.description.trim() || null,
        dataAbertura: draft.openingDate || null,
        dataEncerramento: draft.closingDate || null,
      });
      setCreatedVacancy(created);
      setDraft(emptyDraft);
      onCreated?.(created);
    } catch (error) {
      setSubmitError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit} noValidate>
      <h2>Cadastrar nova vaga de monitoria</h2>
      {submitError && (
        <p className="notice error" role="alert">
          {submitError}
        </p>
      )}
      {createdVacancy && (
        <div className="notice success" role="status">
          <strong>Vaga #{createdVacancy.id} cadastrada com sucesso!</strong>
          <p>
            Status inicial: {createdVacancy.status}.{' '}
            <Link to={`/monitoring-vacancies/${createdVacancy.id}`}>
              Ver detalhes da vaga
            </Link>
          </p>
        </div>
      )}
      <div className="form-grid">
        <FormField
          label="Disciplina (obrigatório)"
          error={errors.subjectId}
          hint="Disciplina atendida pela monitoria."
        >
          <select
            name="subjectId"
            value={draft.subjectId}
            onChange={(event) => update('subjectId', event.target.value)}
            required
          >
            <option value="">Selecione uma disciplina</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {formatSubjectLabel(subject)}
                {subject.department ? ' · ' + subject.department : ''}
              </option>
            ))}
          </select>
        </FormField>
        {isAdmin ? (
          <FormField
            label="Professor responsável (obrigatório)"
            error={errors.professorId}
            hint="Selecione o docente responsável pela vaga."
          >
            <select
              name="professorId"
              value={draft.professorId}
              onChange={(event) => update('professorId', event.target.value)}
              required
            >
              <option value="">Selecione um professor</option>
              {professors.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.name} ({professor.email})
                </option>
              ))}
            </select>
          </FormField>
        ) : (
          <FormField
            label="Professor responsável"
            hint="Identificado automaticamente pela sua sessão autenticada."
          >
            <input
              type="text"
              value={user ? `${user.name} (${user.email})` : ''}
              disabled
            />
          </FormField>
        )}
        <FormField
          label="Semestre (obrigatório)"
          error={errors.semester}
          hint="Formato AAAA/S, por exemplo 2026/2."
        >
          <input
            name="semester"
            type="text"
            inputMode="numeric"
            placeholder="2026/2"
            pattern="[0-9]{4}/(1|2)"
            maxLength={7}
            value={draft.semester}
            onChange={(event) => update('semester', event.target.value)}
            required
          />
        </FormField>
        <FormField
          label="Quantidade de vagas (obrigatório)"
          error={errors.positions}
          hint="Número inteiro maior que zero."
        >
          <input
            name="positions"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={draft.positions}
            onChange={(event) => update('positions', event.target.value)}
            required
          />
        </FormField>
        <FormField label="Tipo da vaga (obrigatório)" error={errors.type}>
          <select
            name="type"
            value={draft.type}
            onChange={(event) =>
              update('type', event.target.value as VacancyDraft['type'])
            }
            required
          >
            <option value="">Selecione o tipo</option>
            {VACANCY_TYPES.map((type) => (
              <option key={type} value={type}>
                {VACANCY_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="Abertura das inscrições (opcional)"
          error={errors.openingDate}
          hint="Data registrada na agenda acadêmica."
        >
          <input
            name="openingDate"
            type="date"
            value={draft.openingDate}
            onChange={(event) => update('openingDate', event.target.value)}
          />
        </FormField>
        <FormField
          label="Encerramento das inscrições (opcional)"
          error={errors.closingDate}
          hint="Data limite registrada na agenda acadêmica."
        >
          <input
            name="closingDate"
            type="date"
            value={draft.closingDate}
            onChange={(event) => update('closingDate', event.target.value)}
          />
        </FormField>
        <FormField
          label="Requisitos (opcional)"
          hint="Critérios para participação, como aprovação prévia na disciplina."
        >
          <textarea
            name="requirements"
            rows={4}
            value={draft.requirements}
            onChange={(event) => update('requirements', event.target.value)}
          />
        </FormField>
        <FormField
          label="Descrição (opcional)"
          hint="Atividades previstas e informações adicionais da vaga."
        >
          <textarea
            name="description"
            rows={4}
            value={draft.description}
            onChange={(event) => update('description', event.target.value)}
          />
        </FormField>
      </div>
      <div className="form-actions">
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Cadastrando vaga...' : 'Cadastrar vaga'}
        </button>
      </div>
    </form>
  );
}
