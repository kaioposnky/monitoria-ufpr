import { useState, type FormEvent } from 'react';
import type { MonitorReviewDraft } from '../../features/monitoring/monitoring.types';
import { REVIEW_DECISIONS } from '../../features/monitoring/monitoring.types';
import {
  displayOptional,
  isPositiveInteger,
  REVIEW_DECISION_LABELS,
} from '../../features/monitoring/monitoring.rules';
import { useDraftReview } from '../../features/monitoring/useDraftReview';
import { DraftReview } from '../DraftReview/DraftReview';
import { FormField } from '../FormField/FormField';
import { IntegrationNotice } from '../IntegrationNotice/IntegrationNotice';

type Errors = Partial<Record<keyof MonitorReviewDraft, string>>;

const emptyDraft: MonitorReviewDraft = {
  applicationId: '',
  decision: '',
  observation: '',
};

export function MonitorReviewForm() {
  const [draft, setDraft] = useState<MonitorReviewDraft>(emptyDraft);
  const [errors, setErrors] = useState<Errors>({});
  const review = useDraftReview();

  function update<K extends keyof MonitorReviewDraft>(
    field: K,
    value: MonitorReviewDraft[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
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
      next.applicationId =
        'Informe um identificador de candidatura inteiro positivo.';
    }
    if (!REVIEW_DECISIONS.some((decision) => decision === values.decision)) {
      next.decision = 'Selecione uma decisão.';
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
        title="Revisar decisão"
        onEdit={review.editDraft}
        sections={[
          {
            title: 'Revisão da candidatura',
            fields: [
              { label: 'ID da candidatura', value: draft.applicationId },
              {
                label: 'Decisão',
                value: draft.decision
                  ? REVIEW_DECISION_LABELS[draft.decision]
                  : 'Não selecionada',
              },
              {
                label: 'Observação',
                value: displayOptional(draft.observation, 'Não informada'),
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
        Dados da revisão
      </h2>
      <IntegrationNotice>
        <p>
          A API atual não permite aprovar nem reprovar candidaturas. Esta tela
          apenas prepara a decisão que será analisada quando a integração
          existir.
        </p>
      </IntegrationNotice>
      <p className="muted">
        Campos propostos: candidatura, decisão e observação. Não há cálculo de
        nota, ordenação ou ranking nesta etapa.
      </p>
      <div className="form-grid">
        <FormField
          label="ID da candidatura (obrigatório)"
          error={errors.applicationId}
          hint="Referência à candidatura já registrada no sistema."
        >
          <input
            name="applicationId"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={draft.applicationId}
            onChange={(event) => update('applicationId', event.target.value)}
            required
          />
        </FormField>
        <FormField
          label="Decisão (obrigatório)"
          error={errors.decision}
          hint="A decisão é registrada manualmente pelo responsável."
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
        <FormField
          label="Observação (opcional)"
          hint="Parecer ou justificativa da decisão."
        >
          <textarea
            name="observation"
            rows={4}
            value={draft.observation}
            onChange={(event) => update('observation', event.target.value)}
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
