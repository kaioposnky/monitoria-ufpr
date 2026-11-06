import { Link } from 'react-router-dom';
import { NavigationCard } from '../../components/NavigationCard/NavigationCard';
export function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">UFPR · Ciências Exatas</p>
        <h1>Monitoria acadêmica em um só lugar.</h1>
        <p>
          Encontre vagas por disciplina e consulte os requisitos. Prepare
          candidaturas e informações de atendimento nas telas de rascunho.
        </p>
        <Link className="primary" to="/monitoring-vacancies">
          Consultar vagas
        </Link>
      </section>
      <section aria-labelledby="student-title">
        <h2 id="student-title">Para estudantes e monitores</h2>
        <div className="grid">
          <NavigationCard
            to="/monitoring-vacancies"
            title="Vagas de monitoria"
            description="Consulte disciplinas, modalidades e requisitos."
            status="Consulta integrada"
          />
          <NavigationCard
            to="/applications/new"
            title="Preparar candidatura"
            description="Preencha e revise os dados antes da futura integração."
            status="Rascunho"
          />
          <NavigationCard
            to="/office-hours"
            title="Horários e disponibilidade"
            description="Prepare os dias, horários e locais de atendimento."
            status="Rascunho"
          />
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
