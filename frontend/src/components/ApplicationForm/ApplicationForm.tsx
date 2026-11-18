import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import type { Subject, Vacancy } from '../../features/catalog/catalog.types';
import { createApplication } from '../../features/monitoring/monitoring.api';
import {
  applicationUnavailableReason,
  formatVacancyLabel,
  isPositiveInteger,
  isScoreInRange,
} from '../../features/monitoring/monitoring.rules';
import type {
  Application,
  ApplicationDraft,
  UserSummary,
} from '../../features/monitoring/monitoring.types';
import { errorMessage } from '../../shared/api/http';
import { FormField } from '../FormField/FormField';

type Props = {
  vacancies: Vacancy[];
  subjects: Subject[];
  students?: UserSummary[];
  initialVacancyId?: number;
  onCreated?: (application: Application) => void;
};

type Errors = Partial<Record<keyof ApplicationDraft, string>>;

const emptyDraft: ApplicationDraft = {
  vacancyId: '',
  studentId: '',
  subjectGrade: '',
  cr: '',
  justification: '',
};

export function ApplicationForm({
  vacancies,
  subjects,
  students = [],
  initialVacancyId,
  onCreated,
}: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [draft, setDraft] = useState<ApplicationDraft>({
    ...emptyDraft,
    vacancyId: initialVacancyId ? String(initialVacancyId) : '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdApplication, setCreatedApplication] =
    useState<Application | null>(null);

  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const effectiveStudentId = isAdmin
    ? draft.studentId
    : user
      ? String(user.id)
      : '';

  function update(field: keyof ApplicationDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSubmitError(null);
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validate(values: ApplicationDraft): Errors {
    const next: Errors = {};
    const selectedVacancy = vacancies.find(
      (vacancy) => String(vacancy.id) === values.vacancyId,
    );
    if (!selectedVacancy) {
      next.vacancyId = 'Selecione uma vaga aberta.';
    } else {
      const reason = applicationUnavailableReason(selectedVacancy);
      if (reason) next.vacancyId = reason;
    }
    if (!isPositiveInteger(effectiveStudentId)) {
      next.studentId = 'Selecione o aluno candidato.';
    }
    if (
      values.subjectGrade.trim().length > 0 &&
      !isScoreInRange(values.subjectGrade)
    ) {
      next.subjectGrade =
        'Informe uma nota entre 0 e 100, com até 2 casas decimais.';
    }
    if (values.cr.trim().length > 0 && !isScoreInRange(values.cr)) {
      next.cr = 'Informe um CR entre 0 e 100, com até 2 casas decimais.';
    }
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate(draft);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createApplication({
        vagaId: Number(draft.vacancyId),
        alunoId: Number(effectiveStudentId),
        notaDisciplina: draft.subjectGrade.trim()
          ? Number(draft.subjectGrade.trim())
          : null,
        cr: draft.cr.trim() ? Number(draft.cr.trim()) : null,
        justificativa: draft.justification.trim() || null,
      });
      setCreatedApplication(created);
      setDraft({
        ...emptyDraft,
        vacancyId: initialVacancyId ? String(initialVacancyId) : '',
      });
      onCreated?.(created);
    } catch (error) {
      setSubmitError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit} noValidate>
      <h2>Dados da candidatura</h2>
      {submitError && (
        <p className="notice error" role="alert">
          {submitError}
        </p>
      )}
      {createdApplication && (
        <div className="notice success" role="status">
          <strong>
            Candidatura #{createdApplication.id} enviada com sucesso!
          </strong>
          <p>
            Status inicial: {createdApplication.status}.{' '}
            <Link to="/management">Acompanhar minhas candidaturas</Link>
          </p>
        </div>
      )}
      <div className="form-grid">
        <FormField
          label="Vaga aberta (obrigatório)"
          error={errors.vacancyId}
          hint={
            initialVacancyId
              ? 'Vaga preenchida a partir do link. Você pode trocar por outra vaga aberta.'
              : 'Somente vagas com inscrições abertas.'
          }
        >
          <select
            name="vacancyId"
            value={draft.vacancyId}
            onChange={(event) => update('vacancyId', event.target.value)}
            required
          >
            <option value="">Selecione uma vaga</option>
            {vacancies.map((vacancy) => (
              <option key={vacancy.id} value={vacancy.id}>
                {formatVacancyLabel(
                  vacancy,
                  subjectById.get(vacancy.subjectId),
                )}
              </option>
            ))}
          </select>
        </FormField>
        {isAdmin ? (
          <FormField
            label="Aluno candidato (obrigatório)"
            error={errors.studentId}
            hint="Selecione o aluno cadastrado para enviar a candidatura."
          >
            <select
              name="studentId"
              value={draft.studentId}
              onChange={(event) => update('studentId', event.target.value)}
              required
            >
              <option value="">Selecione um aluno</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.registration || student.email})
                </option>
              ))}
            </select>
          </FormField>
        ) : (
          <FormField
            label="Aluno candidato"
            hint="Identificado automaticamente pela sua sessão autenticada."
          >
            <input
              type="text"
              value={
                user
                  ? `${user.name} (${user.registration || user.email})`
                  : ''
              }
              disabled
            />
          </FormField>
        )}
        <FormField
          label="Nota da disciplina (opcional)"
          error={errors.subjectGrade}
          hint="Entre 0 e 100, com até 2 casas decimais."
        >
          <input
            name="subjectGrade"
            type="number"
            min="0"
            max="100"
            step="0.01"
            inputMode="decimal"
            value={draft.subjectGrade}
            onChange={(event) => update('subjectGrade', event.target.value)}
          />
        </FormField>
        <FormField
          label="CR (opcional)"
          error={errors.cr}
          hint="Coeficiente de rendimento entre 0 e 100, com até 2 casas decimais."
        >
          <input
            name="cr"
            type="number"
            min="0"
            max="100"
            step="0.01"
            inputMode="decimal"
            value={draft.cr}
            onChange={(event) => update('cr', event.target.value)}
          />
        </FormField>
        <FormField
          label="Justificativa (opcional)"
          hint="Explique o interesse e a experiência com a disciplina."
        >
          <textarea
            name="justification"
            rows={4}
            value={draft.justification}
            onChange={(event) => update('justification', event.target.value)}
          />
        </FormField>
      </div>
      <div className="form-actions">
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Enviando candidatura...' : 'Enviar candidatura'}
        </button>
      </div>
    </form>
  );
}
