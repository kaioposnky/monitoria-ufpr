import { Link } from 'react-router-dom';
import { NavigationCard } from '../../components/NavigationCard/NavigationCard';
import { useAuth } from '../../features/auth/AuthContext';

export function HomePage() {
  const { user } = useAuth();

  return (
    <>
      <section className="hero">
        <p className="eyebrow">UFPR · Ciências Exatas</p>
        <h1>Monitoria acadêmica em um só lugar.</h1>
        <p>
          Consulte vagas abertas por disciplina, envie sua candidatura, acompanhe
          horários de atendimento e gerencie todo o programa de monitorias.
        </p>
        <div className="actions">
          <Link className="primary" to="/monitoring-vacancies">
            Consultar vagas
          </Link>
          {!user && (
            <Link className="button-link" to="/login">
              Entrar no sistema
            </Link>
          )}
        </div>
      </section>
      <section aria-labelledby="student-title">
        <h2 id="student-title">Para estudantes, monitores e docentes</h2>
        <div className="grid">
          <NavigationCard
            to="/monitoring-vacancies"
            title="Vagas de monitoria"
            description="Consulte disciplinas, modalidades e requisitos."
            status="Público"
          />
          <NavigationCard
            to="/applications/new"
            title="Enviar candidatura"
            description="Candidate-se a uma vaga aberta com seu histórico."
            status="ALUNO / ADMIN"
          />
          <NavigationCard
            to="/office-hours"
            title="Horários de atendimento"
            description="Consulte a grade publicada ou gerencie seus horários."
            status="Público / MONITOR"
          />
          <NavigationCard
            to="/management"
            title="Gerenciamento"
            description="Acompanhe candidaturas, vagas, monitores e atividades."
            status="Autenticado"
          />
          {user?.role === 'ADMIN' && (
            <NavigationCard
              to="/admin"
              title="Administração"
              description="Gerencie cursos, matérias, vínculos e usuários."
              status="ADMIN"
            />
          )}
        </div>
      </section>
      <section className="section" aria-labelledby="catalog-title">
        <h2 id="catalog-title">Catálogo acadêmico</h2>
        <div className="grid">
          <NavigationCard
            to="/courses"
            title="Cursos"
            description="Graduações atendidas pelo programa."
          />
          <NavigationCard
            to="/subjects"
            title="Matérias"
            description="Disciplinas e departamentos."
          />
          <NavigationCard
            to="/course-subjects"
            title="Vínculos"
            description="Disciplinas associadas aos cursos."
          />
        </div>
      </section>
    </>
  );
}
