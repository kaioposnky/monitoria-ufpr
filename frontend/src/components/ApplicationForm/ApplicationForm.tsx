import { useState, type FormEvent } from 'react';
import type { Subject, Vacancy } from '../../features/catalog/catalog.types';
import type { ApplicationDraft } from '../../features/monitoring/monitoring.types';
import {
  displayOptional,
  formatVacancyLabel,
  isPositiveInteger,
  isScoreInRange,
} from '../../features/monitoring/monitoring.rules';
import { useDraftReview } from '../../features/monitoring/useDraftReview';
import { DraftReview } from '../DraftReview/DraftReview';
import { FormField } from '../FormField/FormField';
import { IntegrationNotice } from '../IntegrationNotice/IntegrationNotice';

type Props = {
  vacancies: Vacancy[];
  subjects: Subject[];
  initialVacancyId?: number;
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
  initialVacancyId,
}: Props) {
  const [draft, setDraft] = useState<ApplicationDraft>({
    ...emptyDraft,
    vacancyId: initialVacancyId ? String(initialVacancyId) : '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const review = useDraftReview();

  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));

  function update(field: keyof ApplicationDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
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
    if (!values.vacancyId) {
      next.vacancyId = 'Selecione uma vaga aberta.';
    } else if (!selectedVacancy || selectedVacancy.status !== 'ABERTA') {
      next.vacancyId = 'Selecione uma vaga com status ABERTA.';
    }
    if (!isPositiveInteger(values.studentId)) {
      next.studentId = 'Informe um identificador de aluno inteiro positivo.';
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate(draft);
    setErrors(next);
    if (Object.keys(next).length === 0) review.showReview();
  }

  if (review.reviewing) {
    const selectedVacancy = vacancies.find(
      (vacancy) => String(vacancy.id) === draft.vacancyId,
    );
    return (
      <DraftReview
        title="Revisar candidatura"
        onEdit={review.editDraft}
        sections={[
          {
            title: 'Candidatura',
            fields: [
              {
                label: 'Vaga',
                value: selectedVacancy
                  ? formatVacancyLabel(
                      selectedVacancy,
                      subjectById.get(selectedVacancy.subjectId),
                    )
                  : 'Não selecionada',
              },
              {
                label: 'ID do aluno candidato',
                value: draft.studentId.trim(),
              },
              {
                label: 'Nota da disciplina',
                value: displayOptional(draft.subjectGrade, 'Não informada'),
              },
              { label: 'CR', value: displayOptional(draft.cr) },
              {
                label: 'Justificativa',
                value: displayOptional(draft.justification, 'Não informada'),
              },
            ],
          },
          {
            title: 'Vaga escolhida',
            fields: [
              {
                label: 'Requisitos',
                value:
                  selectedVacancy?.requirements?.trim() || 'Não informados',
              },
              {
                label: 'Descrição',
                value: selectedVacancy?.description?.trim() || 'Não informada',
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
        Dados da candidatura
      </h2>
      <IntegrationNotice>
        <p>
          A API disponível apenas consulta o catálogo acadêmico. Este formulário
          monta um rascunho de candidatura; o envio depende de integração
          futura.
        </p>
      </IntegrationNotice>
      <p className="muted">
        Campos propostos: vaga, identificador do aluno, nota da disciplina, CR e
        justificativa. Nota e CR são opcionais, entre 0 e 100; o identificador
        do aluno é um dado de referência ao cadastro existente, não um login. O
        status inicial previsto no esquema é PENDENTE e não é editável aqui.
      </p>
      <div className="form-grid">
        <FormField
          label="Vaga aberta (obrigatório)"
          error={errors.vacancyId}
          hint={
            initialVacancyId
              ? 'Vaga preenchida a partir do link. Você pode trocar por outra vaga aberta.'
              : 'Somente vagas com status ABERTA do catálogo.'
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
        <FormField
          label="ID do aluno candidato (obrigatório)"
          error={errors.studentId}
          hint="Referência ao aluno já cadastrado. Esta tela não autentica nem cria usuários."
        >
          <input
            name="studentId"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={draft.studentId}
            onChange={(event) => update('studentId', event.target.value)}
            required
          />
        </FormField>
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
        <button type="submit" className="primary">
          Revisar dados
        </button>
      </div>
    </form>
  );
}
