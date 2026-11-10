import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { errorMessage } from '../../shared/api/http';
import { FormField } from '../../components/FormField/FormField';
import { PageHeader } from '../../components/PageHeader/PageHeader';

type LocationState = {
  from?: string;
} | null;

const DEMO_ACCOUNTS = [
  {
    label: 'Admin (Coordenação DInf)',
    email: 'coordenacao.dinf@ufpr.br',
    role: 'ADMIN',
  },
  {
    label: 'Professor (Prof. Carlos Eduardo)',
    email: 'carlos.eduardo@ufpr.br',
    role: 'PROFESSOR',
  },
  {
    label: 'Monitor ativo (Lucas Gabriel)',
    email: 'lucas.silva@ufpr.br',
    role: 'MONITOR',
  },
  {
    label: 'Aluno (Gabriel Santos)',
    email: 'gabriel.santos@ufpr.br',
    role: 'ALUNO',
  },
] as const;

export function LoginPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const redirectTarget = state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    if (!email.trim() || !password) {
      setSubmitError('Informe o e-mail e a senha.');
      return;
    }
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      void navigate(redirectTarget, { replace: true });
    } catch (error) {
      setSubmitError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Entrar no sistema"
        description="Autentique-se com seu e-mail institucional e senha para enviar candidaturas, gerenciar monitorias ou acessar a administração."
      />
      {user ? (
        <section className="panel">
          <h2>Sessão ativa</h2>
          <p>
            Conectado como <strong>{user.name}</strong> ({user.email}) — perfil{' '}
            <span className="badge">
              {user.isMonitor ? 'ALUNO · MONITOR' : user.role}
            </span>
          </p>
          <div className="actions">
            <button
              type="button"
              className="primary"
              onClick={() => void navigate('/')}
            >
              Ir para o início
            </button>
            <button type="button" className="secondary" onClick={logout}>
              Sair da conta
            </button>
          </div>
        </section>
      ) : (
        <div className="grid">
          <form className="panel" onSubmit={handleSubmit} noValidate>
            <h2>Credenciais</h2>
            {submitError && (
              <p className="notice error" role="alert">
                {submitError}
              </p>
            )}
            <div className="form-grid">
              <FormField label="E-mail institucional (obrigatório)">
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@ufpr.br"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </FormField>
              <FormField label="Senha (obrigatório)">
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </FormField>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="primary"
                disabled={submitting}
              >
                {submitting ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
          <aside className="panel" aria-label="Contas de desenvolvimento">
            <h2>Contas de teste (ambiente dev)</h2>
            <p className="muted">
              Senha padrão das contas semeadas na migration V3:{' '}
              <code>monitoria123</code>
            </p>
            <div className="stack-actions">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword('monitoria123');
                    setSubmitError(null);
                  }}
                >
                  {account.label} ({account.role})
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
