import { useEffect } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import {
  CoursesPage,
  SubjectsPage,
  CourseSubjectsPage,
  VacanciesPage,
  VacancyDetailsPage,
} from '../features/catalog/CatalogPages';

function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo
      </a>
      <header className="topbar">
        <Link className="brand" to="/">
          Monitoria UFPR <span>Exatas</span>
        </Link>
        <nav aria-label="Navegação principal">
          <NavLink end to="/">
            Início
          </NavLink>
          <NavLink to="/monitoring-vacancies">Vagas</NavLink>
          <NavLink to="/courses">Cursos</NavLink>
          <NavLink to="/subjects">Matérias</NavLink>
          <NavLink to="/course-subjects">Vínculos</NavLink>
        </nav>
      </header>
      <main id="main-content" className="container" tabIndex={-1}>
        <Outlet />
      </main>
      <footer>Monitoria UFPR Exatas · Consulta ao catálogo acadêmico</footer>
    </>
  );
}

function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">UFPR · Ciências Exatas</p>
        <h1>Encontre oportunidades de monitoria.</h1>
        <p>Consulte vagas, requisitos e disciplinas do catálogo acadêmico.</p>
        <Link className="primary" to="/monitoring-vacancies">
          Consultar vagas
        </Link>
      </section>
      <section aria-labelledby="catalog-title">
        <h2 id="catalog-title">Catálogo acadêmico</h2>
        <div className="grid">
          <Link className="card" to="/courses">
            <strong>Cursos</strong>
            <span>Graduações atendidas pelo programa.</span>
          </Link>
          <Link className="card" to="/subjects">
            <strong>Matérias</strong>
            <span>Disciplinas e departamentos.</span>
          </Link>
          <Link className="card" to="/course-subjects">
            <strong>Vínculos</strong>
            <span>Relações entre cursos e matérias.</span>
          </Link>
        </div>
      </section>
    </>
  );
}

export function App() {
  const { pathname } = useLocation();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="course-subjects" element={<CourseSubjectsPage />} />
        <Route path="monitoring-vacancies" element={<VacanciesPage />} />
        <Route
          path="monitoring-vacancies/:id"
          element={<VacancyDetailsPage key={pathname} />}
        />
        <Route
          path="*"
          element={
            <>
              <h1>Página não encontrada</h1>
              <p>Este endereço não corresponde a uma página disponível.</p>
              <Link to="/">Voltar ao início</Link>
            </>
          }
        />
      </Route>
    </Routes>
  );
}
