import { useEffect, useId, useRef } from 'react';
import { IntegrationNotice } from '../IntegrationNotice/IntegrationNotice';

type SummaryField = {
  label: string;
  value: string;
};

type SummarySection = {
  title: string;
  fields: SummaryField[];
};

type Props = {
  title: string;
  sections: SummarySection[];
  onEdit: () => void;
};

export function DraftReview({ title, sections, onEdit }: Props) {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <section className="panel" aria-labelledby={titleId}>
      <h2 id={titleId} ref={titleRef} tabIndex={-1}>
        {title}
      </h2>
      <IntegrationNotice>
        <p>
          Este resumo é apenas uma conferência do rascunho mantido nesta tela.
          Nada foi enviado nem salvo no sistema.
        </p>
      </IntegrationNotice>
      <div className="grid">
        {sections.map((section) => (
          <section key={section.title}>
            <h3>{section.title}</h3>
            <dl>
              {section.fields.map((field) => (
                <div key={field.label}>
                  <dt>{field.label}</dt>
                  <dd
                    className={
                      field.value.includes('\n') ? 'multiline' : undefined
                    }
                  >
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <div className="form-actions">
        <button type="button" className="primary" onClick={onEdit}>
          Editar dados
        </button>
      </div>
    </section>
  );
}
