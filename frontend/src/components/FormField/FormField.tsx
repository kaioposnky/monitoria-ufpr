import { cloneElement, useId, type ReactElement } from 'react';

type Props = {
  label: string;
  children: ReactElement<{
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
  }>;
  hint?: string;
  error?: string;
};

export function FormField({ label, children, hint, error }: Props) {
  const generatedId = useId();
  const id = children.props.id ?? generatedId;
  const describedBy = [
    children.props['aria-describedby'],
    hint ? id + '-hint' : '',
    error ? id + '-error' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, {
        id,
        'aria-describedby': describedBy || undefined,
        'aria-invalid': error ? true : undefined,
      })}
      {hint && <small id={id + '-hint'}>{hint}</small>}
      {error && (
        <p id={id + '-error'} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
