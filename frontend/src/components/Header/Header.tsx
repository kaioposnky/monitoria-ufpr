import { Link, NavLink } from 'react-router-dom';
export function Header() {
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
        <NavLink to="/applications/new">Candidatura</NavLink>
        <NavLink to="/office-hours">Horários</NavLink>
        <NavLink to="/management">Gestão</NavLink>
      </nav>
    </header>
  );
}
