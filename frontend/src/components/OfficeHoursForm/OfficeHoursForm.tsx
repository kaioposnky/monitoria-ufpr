import { useState, type FormEvent } from 'react';
import type { Subject, Vacancy } from '../../features/catalog/catalog.types';
import { createOfficeHours } from '../../features/monitoring/monitoring.api';
import {
  formatSubjectLabel,
  isEndAfterStart,
  isHttpUrl,
  isPositiveInteger,
  isValidTime,
  WEEKDAY_LABELS,
} from '../../features/monitoring/monitoring.rules';
import {
  WEEKDAYS,
  type MonitorRecord,
  type OfficeHoursDraft,
  type OfficeHoursRecord,
  type UserSummary,
} from '../../features/monitoring/monitoring.types';
import { errorMessage } from '../../shared/api/http';
import { FormField } from '../FormField/FormField';

type Props = {
  monitors: MonitorRecord[];
  vacancies: Vacancy[];
  subjects: Subject[];
  users?: UserSummary[];
  onCreated?: (record: OfficeHoursRecord) => void;
};

type Errors = Partial<Record<keyof OfficeHoursDraft, string>>;

const emptyDraft: OfficeHoursDraft = {
  monitorId: '',
  weekday: '',
  startTime: '',
  endTime: '',
  location: '',
  meetingLink: '',
};

export function OfficeHoursForm({
  monitors,
  vacancies,
  subjects,
  users = [],
  onCreated,
}: Props) {
  const activeMonitors = monitors.filter((m) => m.status === 'ATIVO');
  const [draft, setDraft] = useState<OfficeHoursDraft>(() => ({
    ...emptyDraft,
    monitorId: activeMonitors.length === 1 ? String(activeMonitors[0].id) : '',
  }));
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const vacancyById = new Map(vacancies.map((v) => [v.id, v]));
  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const userById = new Map(users.map((u) => [u.id, u]));

  function formatMonitorOption(monitor: MonitorRecord): string {
    const vacancy = vacancyById.get(monitor.vacancyId);
    const subject = vacancy ? subjectById.get(vacancy.subjectId) : undefined;
    const student = userById.get(monitor.studentId);
    const subjectText = subject
      ? formatSubjectLabel(subject)
      : `Vaga #${monitor.vacancyId}`;
    const studentText = student ? student.name : `Aluno #${monitor.studentId}`;
    return `Monitor #${monitor.id} · ${studentText} · ${subjectText}`;
  }

  function update<K extends keyof OfficeHoursDraft>(
    field: K,
    value: OfficeHoursDraft[K],
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

  function validate(values: OfficeHoursDraft): Errors {
    const next: Errors = {};
    if (!isPositiveInteger(values.monitorId)) {
      next.monitorId = 'Selecione o vínculo de monitoria.';
    }
    if (!WEEKDAYS.some((weekday) => weekday === values.weekday)) {
      next.weekday = 'Selecione um dia da semana.';
    }
    if (!isValidTime(values.startTime)) {
      next.startTime = 'Informe o horário inicial.';
    }
    if (!isValidTime(values.endTime)) {
      next.endTime = 'Informe o horário final.';
    } else if (
      isValidTime(values.startTime) &&
      !isEndAfterStart(values.startTime, values.endTime)
    ) {
      next.endTime = 'O horário final deve ser posterior ao inicial.';
    }
    if (values.location.trim().length === 0) {
      next.location = 'Informe o local de atendimento.';
    } else if (values.location.trim().length > 150) {
      next.location = 'O local deve ter no máximo 150 caracteres.';
    }
    if (
      values.meetingLink.trim().length > 0 &&
      !isHttpUrl(values.meetingLink.trim())
    ) {
      next.meetingLink =
        'Informe um link válido, começando com http:// ou https://.';
    }
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate(draft);
    setErrors(next);
    if (Object.keys(next).length > 0 || !draft.weekday) return;

    setSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);
    try {
      const created = await createOfficeHours({
        monitorId: Number(draft.monitorId),
        diaSemana: draft.weekday,
        horaInicio: draft.startTime,
        horaFim: draft.endTime,
        localAtendimento: draft.location.trim(),
        linkReuniao: draft.meetingLink.trim() || null,
      });
      setSuccessMessage('Horário de atendimento cadastrado com sucesso.');
      setDraft({
        ...emptyDraft,
        monitorId:
          activeMonitors.length === 1 ? String(activeMonitors[0].id) : '',
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
      <h2>Cadastrar novo horário de atendimento</h2>
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
          label="Monitoria vinculada (obrigatório)"
          error={errors.monitorId}
          hint="Selecione um vínculo ativo de monitoria."
        >
          <select
            name="monitorId"
            value={draft.monitorId}
            onChange={(event) => update('monitorId', event.target.value)}
            required
          >
            <option value="">Selecione um monitor</option>
            {activeMonitors.map((monitor) => (
              <option key={monitor.id} value={monitor.id}>
                {formatMonitorOption(monitor)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Dia da semana (obrigatório)" error={errors.weekday}>
          <select
            name="weekday"
            value={draft.weekday}
            onChange={(event) =>
              update(
                'weekday',
                event.target.value as OfficeHoursDraft['weekday'],
              )
            }
            required
          >
            <option value="">Selecione o dia</option>
            {WEEKDAYS.map((weekday) => (
              <option key={weekday} value={weekday}>
                {WEEKDAY_LABELS[weekday]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="Horário inicial (obrigatório)"
          error={errors.startTime}
        >
          <input
            name="startTime"
            type="time"
            value={draft.startTime}
            onChange={(event) => update('startTime', event.target.value)}
            required
          />
        </FormField>
        <FormField
          label="Horário final (obrigatório)"
          error={errors.endTime}
          hint="Deve ser posterior ao horário inicial."
        >
          <input
            name="endTime"
            type="time"
            value={draft.endTime}
            onChange={(event) => update('endTime', event.target.value)}
            required
          />
        </FormField>
        <FormField
          label="Local de atendimento (obrigatório)"
          error={errors.location}
          hint="Sala, laboratório ou outro ponto de atendimento."
        >
          <input
            name="location"
            type="text"
            maxLength={150}
            value={draft.location}
            onChange={(event) => update('location', event.target.value)}
            required
          />
        </FormField>
        <FormField
          label="Link da reunião (opcional)"
          error={errors.meetingLink}
          hint="Endereço http:// ou https:// para atendimento remoto."
        >
          <input
            name="meetingLink"
            type="url"
            maxLength={255}
            placeholder="https://"
            value={draft.meetingLink}
            onChange={(event) => update('meetingLink', event.target.value)}
          />
        </FormField>
      </div>
      <div className="form-actions">
        <button
          type="submit"
          className="primary"
          disabled={submitting || activeMonitors.length === 0}
        >
          {submitting ? 'Salvando horário...' : 'Cadastrar horário'}
        </button>
      </div>
    </form>
  );
}
