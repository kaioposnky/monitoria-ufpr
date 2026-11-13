import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { OfficeHoursForm } from '../../components/OfficeHoursForm/OfficeHoursForm';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { QueryResult } from '../../components/QueryResult/QueryResult';
import { useAuth } from '../../features/auth/AuthContext';
import {
  loadSubjects,
  loadVacancies,
} from '../../features/catalog/catalog.api';
import {
  deleteOfficeHours,
  loadAgendaEvents,
  loadMonitors,
  loadMonitorsByStudent,
  loadOfficeHours,
  loadUsers,
} from '../../features/monitoring/monitoring.api';
import {
  formatDateBr,
  formatSubjectLabel,
  formatTimeShort,
  WEEKDAY_LABELS,
} from '../../features/monitoring/monitoring.rules';
import type { MonitorRecord } from '../../features/monitoring/monitoring.types';
import { apiUrl, errorMessage } from '../../shared/api/http';
import { useQuery } from '../../shared/useQuery';

export function OfficeHoursPage() {
  const { user } = useAuth();
  const canManageOfficeHours = Boolean(
    user &&
    (user.role === 'ADMIN' || user.role === 'PROFESSOR' || user.isMonitor),
  );
  const canReadUsers = Boolean(
    user && (user.role === 'ADMIN' || user.role === 'PROFESSOR'),
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadData = useCallback(
    async (signal: AbortSignal) => {
      const [officeHours, agendaEvents, vacancies, subjects, monitors, users] =
        await Promise.all([
          loadOfficeHours(signal),
          loadAgendaEvents(signal),
          loadVacancies(signal),
          loadSubjects(signal),
          user
            ? user.role === 'ALUNO'
              ? loadMonitorsByStudent(user.id, signal)
              : loadMonitors(signal)
            : Promise.resolve([]),
          canReadUsers ? loadUsers(signal) : Promise.resolve([]),
        ]);
      return { officeHours, agendaEvents, vacancies, subjects, monitors, users };
    },
    [user, canReadUsers],
  );

  const query = useQuery(loadData);

  async function handleDelete(id: number) {
    setActionError(null);
    setDeletingId(id);
    try {
      await deleteOfficeHours(id);
      query.retry();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Horários de atendimento"
        description="Consulte os horários publicados pelos monitores e, se você for monitor ativo, professor ou administrador, gerencie os atendimentos."
      >
        <a
          className="button-link"
          href={apiUrl('/agenda/calendario.ics')}
          download="monitoria-ufpr.ics"
        >
          Exportar calendário (.ics)
        </a>
      </PageHeader>
      {actionError && (
        <p className="notice error" role="alert">
          {actionError}
        </p>
      )}
      <QueryResult state={query.state} retry={query.retry}>
        {({ officeHours, agendaEvents, vacancies, subjects, monitors, users }) => {
          const vacancyById = new Map(vacancies.map((v) => [v.id, v]));
          const subjectById = new Map(subjects.map((s) => [s.id, s]));
          const userById = new Map(users.map((u) => [u.id, u]));
          const monitorById = new Map(monitors.map((m) => [m.id, m]));

          const manageableMonitors: MonitorRecord[] =
            user?.role === 'PROFESSOR'
              ? monitors.filter((m) => {
                  const v = vacancyById.get(m.vacancyId);
                  return v?.professorId === user.id;
                })
              : monitors;

          const manageableMonitorIds = new Set(
            manageableMonitors.map((m) => m.id),
          );

          function renderMonitorInfo(monitorId: number): string {
            const monitor = monitorById.get(monitorId);
            if (!monitor) return `Monitor #${monitorId}`;
            const vacancy = vacancyById.get(monitor.vacancyId);
            const subject = vacancy
              ? subjectById.get(vacancy.subjectId)
              : undefined;
            const student = userById.get(monitor.studentId);
            const subjectLabel = subject
              ? formatSubjectLabel(subject)
              : `Vaga #${monitor.vacancyId}`;
            const studentLabel =
              student?.name ??
              (user && monitor.studentId === user.id
                ? user.name
                : `Aluno #${monitor.studentId}`);
            return `${subjectLabel} (${studentLabel})`;
          }

          return (
            <>
              <section
                className="section"
                aria-labelledby="office-hours-list-title"
              >
                <h2 id="office-hours-list-title">Grade de horários cadastrada</h2>
                {officeHours.length === 0 ? (
                  <EmptyState
                    title="Nenhum horário cadastrado"
                    description="Ainda não há horários de atendimento registrados no sistema."
                  />
                ) : (
                  <div className="table-wrap">
                    <table>
                      <caption>Horários de atendimento dos monitores</caption>
                      <thead>
                        <tr>
                          <th>Monitoria</th>
                          <th>Dia</th>
                          <th>Horário</th>
                          <th>Local</th>
                          <th>Link</th>
                          {canManageOfficeHours && <th>Ações</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {officeHours.map((item) => {
                          const canDelete = manageableMonitorIds.has(
                            item.monitorId,
                          );
                          return (
                            <tr key={item.id}>
                              <td>{renderMonitorInfo(item.monitorId)}</td>
                              <td>
                                {WEEKDAY_LABELS[item.weekday] ?? item.weekday}
                              </td>
                              <td>
                                {formatTimeShort(item.startTime)} –{' '}
                                {formatTimeShort(item.endTime)}
                              </td>
                              <td>{item.location}</td>
                              <td>
                                {item.meetingLink ? (
                                  <a
                                    href={item.meetingLink}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Acessar sala
                                  </a>
                                ) : (
                                  'Presencial'
                                )}
                              </td>
                              {canManageOfficeHours && (
                                <td>
                                  {canDelete ? (
                                    <button
                                      type="button"
                                      className="danger compact-button"
                                      disabled={deletingId === item.id}
                                      onClick={() => handleDelete(item.id)}
                                    >
                                      {deletingId === item.id
                                        ? 'Removendo...'
                                        : 'Remover'}
                                    </button>
                                  ) : (
                                    <span className="muted">—</span>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="section" aria-labelledby="agenda-sync-title">
                <h2 id="agenda-sync-title">
                  Agenda acadêmica sincronizada (vagas e horários)
                </h2>
                {agendaEvents.length === 0 ? (
                  <EmptyState
                    title="Nenhum evento sincronizado"
                    description="Cadastre prazos de vagas ou horários de atendimento para preencher a agenda."
                  />
                ) : (
                  <div className="table-wrap">
                    <table>
                      <caption>
                        Eventos publicados no provedor de agenda externa
                      </caption>
                      <thead>
                        <tr>
                          <th>Evento</th>
                          <th>Tipo</th>
                          <th>Quando</th>
                          <th>Local / Detalhes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agendaEvents.map((ev) => (
                          <tr key={ev.externalId}>
                            <td>{ev.title}</td>
                            <td>
                              <span className="badge">{ev.type}</span>
                            </td>
                            <td>
                              {ev.date
                                ? formatDateBr(ev.date)
                                : ev.weekday
                                  ? `${WEEKDAY_LABELS[ev.weekday] ?? ev.weekday} (${formatTimeShort(ev.startTime ?? '')} – ${formatTimeShort(ev.endTime ?? '')})`
                                  : '—'}
                            </td>
                            <td>{ev.locationOrLink ?? ev.description ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="section">
                {canManageOfficeHours ? (
                  manageableMonitors.length > 0 ? (
                    <OfficeHoursForm
                      monitors={manageableMonitors}
                      vacancies={vacancies}
                      subjects={subjects}
                      users={
                        users.length > 0
                          ? users
                          : user
                            ? [
                                {
                                  id: user.id,
                                  name: user.name,
                                  email: user.email,
                                  role: user.role,
                                  registration: user.registration,
                                  courseId: user.courseId,
                                  active: user.active,
                                  createdAt: null,
                                },
                              ]
                            : []
                      }
                      onCreated={() => query.retry()}
                    />
                  ) : (
                    <p className="notice">
                      Não há monitores ativos vinculados às suas vagas no
                      momento.
                    </p>
                  )
                ) : (
                  <p className="notice">
                    {user ? (
                      <>
                        Apenas <strong>monitores ativos</strong>, professores ou
                        administradores podem cadastrar horários de atendimento.
                      </>
                    ) : (
                      <>
                        É monitor, professor ou administrador?{' '}
                        <Link to="/login">Faça login</Link> para cadastrar ou
                        gerenciar horários.
                      </>
                    )}
                  </p>
                )}
              </section>
            </>
          );
        }}
      </QueryResult>
    </>
  );
}
