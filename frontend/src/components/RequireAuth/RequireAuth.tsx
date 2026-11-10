import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import type { UserRole } from '../../features/auth/auth.types';
import { PageHeader } from '../PageHeader/PageHeader';

type Props = {
  roles?: UserRole[];
  allowMonitor?: boolean;
  children: ReactNode;
};

export function RequireAuth({ roles, allowMonitor = false, children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <section className="panel" aria-live="polite">
        <p className="muted">Verificando sessão autenticada...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  const hasRole = !roles || roles.includes(user.role);
  const hasMonitorAccess = allowMonitor && user.isMonitor;

  if (!hasRole && !hasMonitorAccess) {
    return (
      <>
        <PageHeader
          title="Acesso restrito"
          description="Seu perfil autenticado não possui permissão para acessar esta página."
        />
        <section className="panel" role="alert">
          <p>
            Você está conectado como <strong>{user.name}</strong> (
            {user.isMonitor ? 'MONITOR' : user.role}).
          </p>
          <div className="actions">
            <Link className="button-link" to="/">
              Voltar ao início
            </Link>
          </div>
        </section>
      </>
    );
  }

  return <>{children}</>;
}
