import { useState, type FormEvent } from 'react';
import type { Subject, Vacancy } from '../../features/catalog/catalog.types';
import { reviewApplicationStatus } from '../../features/monitoring/monitoring.api';
import {
  APPLICATION_STATUS_LABELS,
  formatSubjectLabel,
  isPositiveInteger,
  REVIEW_DECISION_LABELS,
} from '../../features/monitoring/monitoring.rules';
import {
  REVIEW_DECISIONS,
  type Application,
  type MonitorReviewDraft,
  type UserSummary,
} from '../../features/monitoring/monitoring.types';
import { errorMessage } from '../../shared/api/http';
import { FormField } from '../FormField/FormField';

type Props = {
  applications: Application[];
  vacancies: Vacancy[];
  subjects: Subject[];
  users: UserSummary[];
  onUpdated?: (updated: Application) => void;
};

type Errors = Partial<Record<keyof MonitorReviewDraft, string>>;

const emptyDraft: MonitorReviewDraft = {
  applicationId: '',
  decision: '',
};

export function MonitorReviewForm({
  applications,
  vacancies,
  subjects,
  users,
  onUpdated,
}: Props) {
  const [draft, setDraft] = useState<MonitorReviewDraft>(emptyDraft);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const vacancyById = new Map(vacancies.map((v) => [v.id, v]));
  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const userById = new Map(users.map((u) => [u.id, u]));

  function formatApplicationOption(app: Application): string {
    const student = userById.get(app.studentId);
    const vacancy = vacancyById.get(app.vacancyId);
    const subject = vacancy ? subjectById.get(vacancy.subjectId) : undefined;
    const subjectText = subject
      ? formatSubjectLabel(subject)
      : `Vaga #${app.vacancyId}`;
    const studentText = student ? student.name : `Aluno #${app.studentId}`;
    const statusText = APPLICATION_STATUS_LABELS[app.status] || app.status;
    return `#${app.id} · ${studentText} · ${subjectText} [${statusText}]`;
  }

  function update<K extends keyof MonitorReviewDraft>(
    field: K,
    value: MonitorReviewDraft[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSubmitError(null);
    setSuccessMessage(null);
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validate(values: MonitorReviewDraft): Errors {
    const next: Errors = {};
    if (!isPositiveInteger(values.applicationId)) {
      next.applicationId = 'Selecione uma candidatura para avaliar.';
    }
    if (!REVIEW_DECISIONS.some((decision) => decision === values.decision)) {
      next.decision = 'Selecione uma decisão.';
    }
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate(draft);
    setErrors(next);
    if (Object.keys(next).length > 0 || !draft.decision) return;

    setSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);
    try {
      const updated = await reviewApplicationStatus(
        Number(draft.applicationId),
        draft.decision,
      );
      setSuccessMessage(
        `Candidatura #${updated.id} atualizada para ${APPLICATION_STATUS_LABELS[updated.status]}.`,
      );
      setDraft(emptyDraft);
      onUpdated?.(updated);
    } catch (error) {
      setSubmitError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit} noValidate>
      <h2>Registrar decisão sobre candidatura</h2>
      {submitError && (
        <p className="notice error" role="alert">
          {submitError}
        </p>
      )}
      {successMessage && (
        <p className="notice success" role="status">
          {successMessage}
        </p>
      )}
      <div className="form-grid">
        <FormField
          label="Candidatura (obrigatório)"
          error={errors.applicationId}
          hint="Escolha a candidatura a ser avaliada."
        >
          <select
            name="applicationId"
            value={draft.applicationId}
            onChange={(event) => update('applicationId', event.target.value)}
            required
          >
            <option value="">Selecione uma candidatura</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {formatApplicationOption(app)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="Decisão (obrigatório)"
          error={errors.decision}
          hint="Atualiza o status diretamente no backend."
        >
          <select
            name="decision"
            value={draft.decision}
            onChange={(event) =>
              update(
                'decision',
                event.target.value as MonitorReviewDraft['decision'],
              )
            }
            required
          >
            <option value="">Selecione a decisão</option>
            {REVIEW_DECISIONS.map((decision) => (
              <option key={decision} value={decision}>
                {REVIEW_DECISION_LABELS[decision]}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="form-actions">
        <button
          type="submit"
          className="primary"
          disabled={submitting || applications.length === 0}
        >
          {submitting ? 'Registrando decisão...' : 'Confirmar decisão'}
        </button>
      </div>
    </form>
  );
}
