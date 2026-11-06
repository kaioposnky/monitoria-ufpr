import { useState, type FormEvent } from 'react';
import type { Subject } from '../../features/catalog/catalog.types';
import type { VacancyDraft } from '../../features/monitoring/monitoring.types';
import { VACANCY_TYPES } from '../../features/monitoring/monitoring.types';
import {
  displayOptional,
  formatSubjectLabel,
  isPositiveInteger,
  isSemester,
  VACANCY_TYPE_LABELS,
} from '../../features/monitoring/monitoring.rules';
import { useDraftReview } from '../../features/monitoring/useDraftReview';
import { DraftReview } from '../DraftReview/DraftReview';
import { FormField } from '../FormField/FormField';
import { IntegrationNotice } from '../IntegrationNotice/IntegrationNotice';

type Props = {
  subjects: Subject[];
};

type Errors = Partial<Record<keyof VacancyDraft, string>>;

const emptyDraft: VacancyDraft = {
  subjectId: '',
  professorId: '',
  semester: '',
  positions: '',
  type: '',
  requirements: '',
  description: '',
};

export function VacancyForm({ subjects }: Props) {
  const [draft, setDraft] = useState<VacancyDraft>(emptyDraft);
  const [errors, setErrors] = useState<Errors>({});
  const review = useDraftReview();

  function update<K extends keyof VacancyDraft>(
    field: K,
    value: VacancyDraft[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
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
      next.subjectId = 'Selecione uma matéria do catálogo.';
    }
    if (!isPositiveInteger(values.professorId)) {
      next.professorId =
        'Informe um identificador de professor inteiro positivo.';
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
    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate(draft);
    setErrors(next);
    if (Object.keys(next).length === 0) review.showReview();
  }

  if (review.reviewing) {
    const subject = subjects.find(
      (item) => String(item.id) === draft.subjectId,
    );
    return (
      <DraftReview
        title="Revisar vaga de monitoria"
        onEdit={review.editDraft}
        sections={[
          {
            title: 'Vaga',
            fields: [
              {
                label: 'Matéria',
                value: subject
                  ? formatSubjectLabel(subject)
                  : 'Não selecionada',
              },
              {
                label: 'Professor responsável (ID)',
                value: draft.professorId,
              },
              { label: 'Semestre', value: draft.semester },
              { label: 'Quantidade de vagas', value: draft.positions },
              {
                label: 'Tipo',
                value: draft.type ? VACANCY_TYPE_LABELS[draft.type] : '—',
              },
            ],
          },
          {
            title: 'Detalhes',
            fields: [
              {
                label: 'Requisitos',
                value: displayOptional(draft.requirements, 'Não informados'),
              },
              {
                label: 'Descrição',
                value: displayOptional(draft.description, 'Não informada'),
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
        Dados da vaga
      </h2>
      <IntegrationNotice>
        <p>
          A matéria vem do catálogo consultado no backend, mas o cadastro de
          vagas ainda não possui operação de escrita na API.
        </p>
      </IntegrationNotice>
      <p className="muted">
        Campos propostos: matéria do catálogo, professor responsável, semestre,
        quantidade de vagas, tipo, requisitos e descrição. O ID do professor é
        um dado de referência, não uma autenticação. O status inicial previsto
        no esquema é ABERTA e não é editável aqui.
      </p>
      <div className="form-grid">
        <FormField
          label="Matéria (obrigatório)"
          error={errors.subjectId}
          hint="Escolha uma matéria real do catálogo acadêmico."
        >
          <select
            name="subjectId"
            value={draft.subjectId}
            onChange={(event) => update('subjectId', event.target.value)}
            required
          >
            <option value="">Selecione uma matéria</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {formatSubjectLabel(subject)}
                {subject.department ? ' · ' + subject.department : ''}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="ID do professor responsável (obrigatório)"
          error={errors.professorId}
          hint="Referência a um professor já cadastrado. Esta tela não autentica nem cria usuários."
        >
          <input
            name="professorId"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={draft.professorId}
            onChange={(event) => update('professorId', event.target.value)}
            required
          />
        </FormField>
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
        <button type="submit" className="primary">
          Revisar dados
        </button>
      </div>
    </form>
  );
}
