import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    void navigate('/');
  }

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        Monitoria UFPR <span>Exatas</span>
      </Link>
      <nav aria-label="Navegação principal">
        <NavLink end to="/">
          Início
        </NavLink>
        <NavLink to="/monitoring-vacancies">Vagas</NavLink>
        {(!user || user.role === 'ALUNO' || user.role === 'ADMIN') && (
          <NavLink to="/applications/new">Candidatura</NavLink>
        )}
        <NavLink to="/office-hours">Horários</NavLink>
        {user && <NavLink to="/management">Gestão</NavLink>}
        {user?.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="topbar-user">
        {user ? (
          <>
            <span className="badge">
              {user.name} · {user.isMonitor ? 'MONITOR' : user.role}
            </span>
            <button
              type="button"
              className="secondary compact-button"
              onClick={handleLogout}
            >
              Sair
            </button>
          </>
        ) : (
          <NavLink className="button-link compact-button" to="/login">
            Entrar
          </NavLink>
        )}
      </div>
    </header>
  );
}
