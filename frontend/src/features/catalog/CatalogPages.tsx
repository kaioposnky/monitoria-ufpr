import { Link, useParams } from 'react-router-dom';
import { useCallback } from 'react';
import { useQuery } from '../../shared/useQuery';
import { QueryResult } from '../../shared/components/QueryResult';
import {
  loadCourses,
  loadSubjects,
  loadRelations,
  loadVacancies,
  loadVacancy,
} from './catalog.api';

const labels: Record<string, string> = {
  ABERTA: 'Aberta',
  EM_SELECAO: 'Em seleção',
  ENCERRADA: 'Encerrada',
  CANCELADA: 'Cancelada',
  REMUNERADA: 'Remunerada',
  VOLUNTARIA: 'Voluntária',
};
const label = (value: string) => labels[value] ?? value;

export function CoursesPage() {
  const query = useQuery(loadCourses);
  return (
    <>
      <h1>Cursos</h1>
      <p>Graduações atendidas pelo programa de monitoria.</p>
      <QueryResult {...query}>
        {(courses) =>
          courses.length ? (
            <div className="table-wrap">
              <table>
                <caption>Cursos cadastrados</caption>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Setor</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>{course.code}</td>
                      <td>{course.name}</td>
                      <td>{course.sector ?? 'Não informado'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="panel">Nenhum curso cadastrado.</p>
          )
        }
      </QueryResult>
    </>
  );
}

export function SubjectsPage() {
  const query = useQuery(loadSubjects);
  return (
    <>
      <h1>Matérias</h1>
      <p>Disciplinas do catálogo acadêmico.</p>
      <QueryResult {...query}>
        {(subjects) =>
          subjects.length ? (
            <div className="table-wrap">
              <table>
                <caption>Matérias cadastradas</caption>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Departamento</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id}>
                      <td>{subject.code}</td>
                      <td>{subject.name}</td>
                      <td>{subject.department ?? 'Não informado'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="panel">Nenhuma matéria cadastrada.</p>
          )
        }
      </QueryResult>
    </>
  );
}

async function loadCourseSubjects(signal: AbortSignal) {
  const [courses, subjects, relations] = await Promise.all([
    loadCourses(signal),
    loadSubjects(signal),
    loadRelations(signal),
  ]);
  return { courses, subjects, relations };
}

export function CourseSubjectsPage() {
  const query = useQuery(loadCourseSubjects);
  return (
    <>
      <h1>Vínculos curso–matéria</h1>
      <p>Disciplinas associadas a cada curso.</p>
      <QueryResult {...query}>
        {({ courses, subjects, relations }) =>
          relations.length ? (
            <div className="table-wrap">
              <table>
                <caption>Vínculos cadastrados</caption>
                <thead>
                  <tr>
                    <th>Curso</th>
                    <th>Matéria</th>
                  </tr>
                </thead>
                <tbody>
                  {relations.map((relation) => (
                    <tr key={relation.courseId + ':' + relation.subjectId}>
                      <td>
                        {courses.find(
                          (course) => course.id === relation.courseId,
                        )?.name ?? 'Curso #' + relation.courseId}
                      </td>
                      <td>
                        {subjects.find(
                          (subject) => subject.id === relation.subjectId,
                        )?.name ?? 'Matéria #' + relation.subjectId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="panel">Nenhum vínculo cadastrado.</p>
          )
        }
      </QueryResult>
    </>
  );
}

async function loadVacancyCatalog(signal: AbortSignal) {
  const [vacancies, subjects] = await Promise.all([
    loadVacancies(signal),
    loadSubjects(signal),
  ]);
  return { vacancies, subjects };
}

export function VacanciesPage() {
  const query = useQuery(loadVacancyCatalog);
  return (
    <>
      <h1>Vagas de monitoria</h1>
      <p>Consulte as oportunidades e os requisitos de cada vaga.</p>
      <QueryResult {...query}>
        {({ vacancies, subjects }) =>
          vacancies.length ? (
            <div className="grid">
              {vacancies.map((vacancy) => (
                <article className="panel" key={vacancy.id}>
                  <span className="badge">{label(vacancy.status)}</span>
                  <h2>
                    {subjects.find(
                      (subject) => subject.id === vacancy.subjectId,
                    )?.name ?? 'Matéria #' + vacancy.subjectId}
                  </h2>
                  <p>
                    {vacancy.semester} · {label(vacancy.type)}
                  </p>
                  <p>{vacancy.positions} vaga(s)</p>
                  <Link to={'/monitoring-vacancies/' + vacancy.id}>
                    Ver detalhes da vaga
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p className="panel">Nenhuma vaga cadastrada.</p>
          )
        }
      </QueryResult>
    </>
  );
}

export function VacancyDetailsPage() {
  const { id = '' } = useParams();
  const load = useCallback(
    async (signal: AbortSignal) => {
      const [vacancy, subjects] = await Promise.all([
        loadVacancy(id, signal),
        loadSubjects(signal),
      ]);
      return { vacancy, subjects };
    },
    [id],
  );
  const query = useQuery(load);
  return (
    <>
      <Link to="/monitoring-vacancies">← Voltar às vagas</Link>
      <h1>Detalhes da vaga</h1>
      <QueryResult {...query}>
        {({ vacancy, subjects }) => (
          <article className="panel">
            <span className="badge">{label(vacancy.status)}</span>
            <h2>
              {subjects.find((subject) => subject.id === vacancy.subjectId)
                ?.name ?? 'Matéria #' + vacancy.subjectId}
            </h2>
            <dl>
              <dt>Semestre</dt>
              <dd>{vacancy.semester}</dd>
              <dt>Modalidade</dt>
              <dd>{label(vacancy.type)}</dd>
              <dt>Quantidade de vagas</dt>
              <dd>{vacancy.positions}</dd>
              <dt>Professor responsável</dt>
              <dd>Identificador {vacancy.professorId}</dd>
              <dt>Requisitos</dt>
              <dd className="multiline">
                {vacancy.requirements || 'Não informados.'}
              </dd>
              <dt>Descrição</dt>
              <dd className="multiline">
                {vacancy.description || 'Não informada.'}
              </dd>
            </dl>
            <p className="notice">
              A consulta está disponível. O envio de candidaturas ainda não está
              disponível na API.
            </p>
          </article>
        )}
      </QueryResult>
    </>
  );
}
