import { useState, type FormEvent } from 'react';
import type { OfficeHoursDraft } from '../../features/monitoring/monitoring.types';
import { WEEKDAYS } from '../../features/monitoring/monitoring.types';
import {
  displayOptional,
  isEndAfterStart,
  isHttpUrl,
  isPositiveInteger,
  isValidTime,
  WEEKDAY_LABELS,
} from '../../features/monitoring/monitoring.rules';
import { useDraftReview } from '../../features/monitoring/useDraftReview';
import { DraftReview } from '../DraftReview/DraftReview';
import { FormField } from '../FormField/FormField';
import { IntegrationNotice } from '../IntegrationNotice/IntegrationNotice';

type Errors = Partial<Record<keyof OfficeHoursDraft, string>>;

const emptyDraft: OfficeHoursDraft = {
  monitorId: '',
  weekday: '',
  startTime: '',
  endTime: '',
  location: '',
  meetingLink: '',
};

export function OfficeHoursForm() {
  const [draft, setDraft] = useState<OfficeHoursDraft>(emptyDraft);
  const [errors, setErrors] = useState<Errors>({});
  const review = useDraftReview();

  function update<K extends keyof OfficeHoursDraft>(
    field: K,
    value: OfficeHoursDraft[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
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
      next.monitorId = 'Informe um identificador de monitor inteiro positivo.';
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate(draft);
    setErrors(next);
    if (Object.keys(next).length === 0) review.showReview();
  }

  if (review.reviewing) {
    return (
      <DraftReview
        title="Revisar disponibilidade"
        onEdit={review.editDraft}
        sections={[
          {
            title: 'Disponibilidade',
            fields: [
              { label: 'ID do monitor', value: draft.monitorId },
              {
                label: 'Dia da semana',
                value: draft.weekday
                  ? WEEKDAY_LABELS[draft.weekday]
                  : 'Não selecionado',
              },
              { label: 'Início', value: draft.startTime },
              { label: 'Fim', value: draft.endTime },
              { label: 'Local', value: draft.location },
              {
                label: 'Link da reunião',
                value: displayOptional(draft.meetingLink),
              },
            ],
          },
        ]}
      />
    );
  }

  return (
    <form className="panel" onSubmit={handleSubmit} noValidate>
      <h2 ref={review.formHeadingRef} tabIndex={-1}>
        Dados de disponibilidade
      </h2>
      <IntegrationNotice>
        <p>
          A API atual não possui operação de consulta nem de gravação de
          horários. A verificação de conflitos com horários já cadastrados não é
          possível nesta tela.
        </p>
      </IntegrationNotice>
      <p className="muted">
        Campos propostos: monitor, dia da semana, horário inicial, horário
        final, local e link opcional. O horário final precisa ser posterior ao
        inicial.
      </p>
      <div className="form-grid">
        <FormField
          label="ID do monitor (obrigatório)"
          error={errors.monitorId}
          hint="Referência ao monitor já cadastrado. Esta tela não autentica usuários."
        >
          <input
            name="monitorId"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={draft.monitorId}
            onChange={(event) => update('monitorId', event.target.value)}
            required
          />
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
        <button type="submit" className="primary">
          Revisar dados
        </button>
      </div>
    </form>
  );
}
