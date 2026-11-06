import type { ReactNode } from 'react';
type Props = { children?: ReactNode };
export function IntegrationNotice({ children }: Props) {
  return (
    <aside
      className="notice integration-notice"
      aria-label="Estado da integração"
    >
      <strong>Integração pendente</strong>
      <p>
        O backend ainda não oferece esta operação. Os dados preenchidos são
        apenas um rascunho nesta tela, serão perdidos ao sair e não serão
        enviados nem salvos.
      </p>
      {children}
    </aside>
  );
}
