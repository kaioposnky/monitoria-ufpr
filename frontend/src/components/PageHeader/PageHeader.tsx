import type { ReactNode } from 'react';
type Props = { title: string; description: string; children?: ReactNode };
export function PageHeader({ title, description, children }: Props) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="page-actions">{children}</div>}
    </header>
  );
}
