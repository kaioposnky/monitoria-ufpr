import { useCallback, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ActivityLogsPanel } from '../../components/ActivityLogsPanel/ActivityLogsPanel';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { FormField } from '../../components/FormField/FormField';
import { MonitorsPanel } from '../../components/MonitorsPanel/MonitorsPanel';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { QueryResult } from '../../components/QueryResult/QueryResult';
import { useAuth } from '../../features/auth/AuthContext';
import {
  loadSubjects,
  loadVacancies,
} from '../../features/catalog/catalog.api';
import type { Vacancy } from '../../features/catalog/catalog.types';
import {
  createMonitor,
  deleteApplication,
  deleteVacancy,
  loadActivityLogs,
  loadActivityLogsByMonitor,
  loadApplications,
  loadApplicationsByStudent,
  loadMonitors,
  loadMonitorsByStudent,
  loadUsers,
  patchVacancyStatus,
  updateApplicationStatus,
  updateVacancy,
} from '../../features/monitoring/monitoring.api';
import {
  APPLICATION_STATUS_LABELS,
  formatSubjectLabel,
  VACANCY_STATUS_LABELS,
  VACANCY_TYPE_LABELS,
} from '../../features/monitoring/monitoring.rules';
import {
  VACANCY_STATUSES,
  VACANCY_TYPES,
  type Application,
  type ApplicationStatus,
  type VacancyStatus,
  type VacancyType,
} from '../../features/monitoring/monitoring.types';
import { errorMessage } from '../../shared/api/http';
import { useQuery } from '../../shared/useQuery';

type ManagementTab = 'vacancies' | 'applications' | 'monitors' | 'activities';

export function ManagementPage() {
  const { user, refreshUser } = useAuth();
  const isStaff = user?.role === 'PROFESSOR' || user?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState<ManagementTab>(
    isStaff ? 'vacancies' : 'applications',
  );
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [editSemester, setEditSemester] = useState('');
  const [editPositions, setEditPositions] = useState('');
  const [editType, setEditType] = useState<VacancyType>('REMUNERADA');
  const [editStatus, setEditStatus] = useState<VacancyStatus>('ABERTA');
  const [editRequirements, setEditRequirements] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editOpeningDate, setEditOpeningDate] = useState('');
  const [editClosingDate, setEditClosingDate] = useState('');

  const loadManagementData = useCallback(
    async (signal: AbortSignal) => {
      if (!user) {
        return {
          vacancies: [],
          subjects: [],
          applications: [],
          monitors: [],
          logs: [],
          users: [],
        };
      }
      const [vacancies, subjects, applications, monitors, users] =
        await Promise.all([
          loadVacancies(signal),
          loadSubjects(signal),
          isStaff
            ? loadApplications(signal)
            : loadApplicationsByStudent(user.id, signal),
          isStaff ? loadMonitors(signal) : loadMonitorsByStudent(user.id, signal),
          isStaff ? loadUsers(signal) : Promise.resolve([]),
        ]);

      const logs = isStaff
        ? await loadActivityLogs(signal)
        : (
            await Promise.all(
              monitors.map((m) => loadActivityLogsByMonitor(m.id, signal)),
            )
          ).flat();

      return { vacancies, subjects, applications, monitors, logs, users };
    },
    [user, isStaff],
  );

  const query = useQuery(loadManagementData);

  function startEditVacancy(vacancy: Vacancy) {
    setEditingVacancy(vacancy);
    setEditSemester(vacancy.semester);
    setEditPositions(String(vacancy.positions));
    setEditType(vacancy.type as VacancyType);
    setEditStatus(vacancy.status as VacancyStatus);
    setEditRequirements(vacancy.requirements ?? '');
    setEditDescription(vacancy.description ?? '');
    setEditOpeningDate(vacancy.openingDate ?? '');
    setEditClosingDate(vacancy.closingDate ?? '');
    setActionError(null);
    setActionSuccess(null);
  }

  async function handleSaveVacancy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingVacancy) return;
    setActionError(null);
    setActionSuccess(null);
    setBusyKey(`save-v-${editingVacancy.id}`);
    try {
      await updateVacancy(editingVacancy.id, {
        semestre: editSemester.trim(),
        quantidadeVagas: Number(editPositions),
        tipoVaga: editType,
        requisitos: editRequirements.trim() || null,
        descricao: editDescription.trim() || null,
        status: editStatus,
        dataAbertura: editOpeningDate || null,
        dataEncerramento: editClosingDate || null,
      });
      setActionSuccess(`Vaga #${editingVacancy.id} atualizada.`);
      setEditingVacancy(null);
      query.retry();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleQuickVacancyStatus(
    vacancyId: number,
    status: VacancyStatus,
  ) {
    setActionError(null);
    setActionSuccess(null);
    setBusyKey(`status-v-${vacancyId}`);
    try {
      await patchVacancyStatus(vacancyId, status);
      setActionSuccess(`Status da vaga #${vacancyId} alterado.`);
      query.retry();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleDeleteVacancy(vacancyId: number) {
    setActionError(null);
    setActionSuccess(null);
    setBusyKey(`del-v-${vacancyId}`);
    try {
      await deleteVacancy(vacancyId);
      setActionSuccess(`Vaga #${vacancyId} removida.`);
      if (editingVacancy?.id === vacancyId) setEditingVacancy(null);
      query.retry();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleApplicationStatus(
    appId: number,
    status: ApplicationStatus,
  ) {
    setActionError(null);
    setActionSuccess(null);
    setBusyKey(`status-a-${appId}`);
    try {
      await updateApplicationStatus(appId, status);
      setActionSuccess(`Candidatura #${appId} atualizada para ${status}.`);
      query.retry();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleDeleteApplication(appId: number) {
    setActionError(null);
    setActionSuccess(null);
    setBusyKey(`del-a-${appId}`);
    try {
      await deleteApplication(appId);
      setActionSuccess(`Candidatura #${appId} excluída.`);
      query.retry();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setBusyKey(null);
    }
  }

  async function handlePromoteToMonitor(app: Application) {
    setActionError(null);
    setActionSuccess(null);
    setBusyKey(`promote-${app.id}`);
    try {
      await createMonitor({
        vagaId: app.vacancyId,
        alunoId: app.studentId,
        candidaturaId: app.id,
        cargaHorariaSemanal: 12,
        dataInicio: new Date().toISOString().slice(0, 10),
        dataFim: null,
      });
      setActionSuccess(
        `Aluno #${app.studentId} efetivado como monitor na vaga #${app.vacancyId}.`,
      );
      await refreshUser();
      query.retry();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setBusyKey(null);
    }
  }

  const tabs: { id: ManagementTab; label: string }[] = [
    ...(isStaff ? [{ id: 'vacancies' as const, label: 'Vagas' }] : []),
    { id: 'applications', label: isStaff ? 'Candidaturas' : 'Minhas candidaturas' },
    { id: 'monitors', label: isStaff ? 'Monitores' : 'Minhas monitorias' },
    { id: 'activities', label: 'Registros de atividades' },
  ];

  const currentTab = tabs.some((t) => t.id === activeTab)
    ? activeTab
    : tabs[0].id;

  return (
    <>
      <PageHeader
        title="Gerenciamento de monitorias"
        description={
          isStaff
            ? 'Gerencie vagas, analise candidaturas, efetive monitores e aprove registros de atividades.'
            : 'Acompanhe suas candidaturas, vínculos de monitoria e registros de atividades.'
        }
      >
        {isStaff && (
          <Link className="primary" to="/management/vacancies/new">
            Nova vaga
          </Link>
        )}
        {(user?.role === 'ALUNO' || user?.role === 'ADMIN') && (
          <Link className="button-link" to="/applications/new">
            Nova candidatura
          </Link>
        )}
      </PageHeader>

      {actionError && (
        <p className="notice error" role="alert">
          {actionError}
        </p>
      )}
      {actionSuccess && (
        <p className="notice success" role="status">
          {actionSuccess}
        </p>
      )}

      <div className="tabs" role="tablist" aria-label="Áreas de gerenciamento">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className="tab-button"
            aria-selected={currentTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <QueryResult state={query.state} retry={query.retry}>
        {({ vacancies, subjects, applications, monitors, logs, users }) => {
          const subjectById = new Map(subjects.map((s) => [s.id, s]));
          const vacancyById = new Map(vacancies.map((v) => [v.id, v]));
          const userById = new Map(users.map((u) => [u.id, u]));

          const ownedVacancies =
            user?.role === 'PROFESSOR'
              ? vacancies.filter((v) => v.professorId === user.id)
              : vacancies;
          const ownedVacancyIds = new Set(ownedVacancies.map((v) => v.id));

          const scopedApplications =
            user?.role === 'PROFESSOR'
              ? applications.filter((a) => ownedVacancyIds.has(a.vacancyId))
              : applications;

          const scopedMonitors =
            user?.role === 'PROFESSOR'
              ? monitors.filter((m) => ownedVacancyIds.has(m.vacancyId))
              : monitors;
          const scopedMonitorIds = new Set(scopedMonitors.map((m) => m.id));

          const scopedLogs =
            user?.role === 'PROFESSOR'
              ? logs.filter((l) => scopedMonitorIds.has(l.monitorId))
              : logs;

          const monitorPairSet = new Set(
            monitors.map((m) => `${m.vacancyId}:${m.studentId}`),
          );

          if (currentTab === 'vacancies' && isStaff) {
            return (
              <div className="stack-actions">
                {editingVacancy && (
                  <form className="panel" onSubmit={handleSaveVacancy}>
                    <h2>Editar vaga #{editingVacancy.id}</h2>
                    <div className="form-grid">
                      <FormField label="Semestre">
                        <input
                          type="text"
                          value={editSemester}
                          onChange={(e) => setEditSemester(e.target.value)}
                          required
                        />
                      </FormField>
                      <FormField label="Quantidade de vagas">
                        <input
                          type="number"
                          min="1"
                          value={editPositions}
                          onChange={(e) => setEditPositions(e.target.value)}
                          required
                        />
                      </FormField>
                      <FormField label="Modalidade">
                        <select
                          value={editType}
                          onChange={(e) =>
                            setEditType(e.target.value as VacancyType)
                          }
                        >
                          {VACANCY_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {VACANCY_TYPE_LABELS[t]}
                            </option>
                          ))}
                        </select>
                      </FormField>
                      <FormField label="Status">
                        <select
                          value={editStatus}
                          onChange={(e) =>
                            setEditStatus(e.target.value as VacancyStatus)
                          }
                        >
                          {VACANCY_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {VACANCY_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </FormField>
                      <FormField label="Abertura das inscrições">
                        <input
                          type="date"
                          value={editOpeningDate}
                          onChange={(e) => setEditOpeningDate(e.target.value)}
                        />
                      </FormField>
                      <FormField label="Encerramento das inscrições">
                        <input
                          type="date"
                          value={editClosingDate}
                          onChange={(e) => setEditClosingDate(e.target.value)}
                        />
                      </FormField>
                      <FormField label="Requisitos">
                        <textarea
                          rows={3}
                          value={editRequirements}
                          onChange={(e) => setEditRequirements(e.target.value)}
                        />
                      </FormField>
                      <FormField label="Descrição">
                        <textarea
                          rows={3}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                      </FormField>
                    </div>
                    <div className="form-actions">
                      <button
                        type="submit"
                        className="primary"
                        disabled={busyKey === `save-v-${editingVacancy.id}`}
                      >
                        Salvar alterações
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setEditingVacancy(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                {ownedVacancies.length === 0 ? (
                  <EmptyState
                    title="Nenhuma vaga cadastrada"
                    description="Cadastre uma nova vaga para começar a receber candidaturas."
                  />
                ) : (
                  <div className="table-wrap">
                    <table>
                      <caption>Vagas de monitoria sob sua gestão</caption>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Disciplina</th>
                          <th>Semestre</th>
                          <th>Vagas / Tipo</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ownedVacancies.map((v) => {
                          const subject = subjectById.get(v.subjectId);
                          return (
                            <tr key={v.id}>
                              <td>#{v.id}</td>
                              <td>
                                {subject
                                  ? formatSubjectLabel(subject)
                                  : `Disciplina #${v.subjectId}`}
                              </td>
                              <td>{v.semester}</td>
                              <td>
                                {v.positions} ·{' '}
                                {VACANCY_TYPE_LABELS[v.type as VacancyType] ??
                                  v.type}
                              </td>
                              <td>
                                <select
                                  aria-label={`Status da vaga ${v.id}`}
                                  value={v.status}
                                  disabled={busyKey === `status-v-${v.id}`}
                                  onChange={(e) =>
                                    handleQuickVacancyStatus(
                                      v.id,
                                      e.target.value as VacancyStatus,
                                    )
                                  }
                                >
                                  {VACANCY_STATUSES.map((st) => (
                                    <option key={st} value={st}>
                                      {VACANCY_STATUS_LABELS[st]}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <div className="inline-actions">
                                  <button
                                    type="button"
                                    className="secondary compact-button"
                                    onClick={() => startEditVacancy(v)}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    className="danger compact-button"
                                    disabled={busyKey === `del-v-${v.id}`}
                                    onClick={() => handleDeleteVacancy(v.id)}
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          }

          if (currentTab === 'applications') {
            return scopedApplications.length === 0 ? (
              <EmptyState
                title="Nenhuma candidatura encontrada"
                description="Ainda não há candidaturas para exibir nesta visão."
              />
            ) : (
              <div className="table-wrap">
                <table>
                  <caption>Candidaturas registradas</caption>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Vaga / Disciplina</th>
                      {isStaff && <th>Aluno</th>}
                      <th>Nota / CR</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopedApplications.map((app) => {
                      const v = vacancyById.get(app.vacancyId);
                      const s = v ? subjectById.get(v.subjectId) : undefined;
                      const student = userById.get(app.studentId);
                      const alreadyMonitor = monitorPairSet.has(
                        `${app.vacancyId}:${app.studentId}`,
                      );
                      return (
                        <tr key={app.id}>
                          <td>#{app.id}</td>
                          <td>
                            {s
                              ? `${formatSubjectLabel(s)} (${v?.semester ?? ''})`
                              : `Vaga #${app.vacancyId}`}
                          </td>
                          {isStaff && (
                            <td>
                              {student?.name ?? `Aluno #${app.studentId}`}
                            </td>
                          )}
                          <td>
                            Nota: {app.subjectGrade ?? '—'} · CR:{' '}
                            {app.cr ?? '—'}
                          </td>
                          <td>
                            <span className="badge">
                              {APPLICATION_STATUS_LABELS[app.status]}
                            </span>
                          </td>
                          <td>
                            <div className="inline-actions">
                              {isStaff ? (
                                <>
                                  <button
                                    type="button"
                                    className="compact-button"
                                    disabled={busyKey === `status-a-${app.id}`}
                                    onClick={() =>
                                      handleApplicationStatus(
                                        app.id,
                                        'APROVADO',
                                      )
                                    }
                                  >
                                    Aprovar
                                  </button>
                                  <button
                                    type="button"
                                    className="secondary compact-button"
                                    disabled={busyKey === `status-a-${app.id}`}
                                    onClick={() =>
                                      handleApplicationStatus(
                                        app.id,
                                        'REPROVADO',
                                      )
                                    }
                                  >
                                    Reprovar
                                  </button>
                                  {app.status === 'APROVADO' &&
                                    !alreadyMonitor && (
                                      <button
                                        type="button"
                                        className="secondary compact-button"
                                        disabled={
                                          busyKey === `promote-${app.id}`
                                        }
                                        onClick={() =>
                                          handlePromoteToMonitor(app)
                                        }
                                      >
                                        Efetivar monitor
                                      </button>
                                    )}
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className="danger compact-button"
                                  disabled={busyKey === `del-a-${app.id}`}
                                  onClick={() =>
                                    handleDeleteApplication(app.id)
                                  }
                                >
                                  Cancelar candidatura
                                </button>
                              )}
                              {user?.role === 'ADMIN' && (
                                <button
                                  type="button"
                                  className="danger compact-button"
                                  disabled={busyKey === `del-a-${app.id}`}
                                  onClick={() =>
                                    handleDeleteApplication(app.id)
                                  }
                                >
                                  Excluir
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          }

          if (currentTab === 'monitors') {
            return (
              <MonitorsPanel
                monitors={scopedMonitors}
                vacancies={vacancies}
                subjects={subjects}
                users={users}
                applications={scopedApplications}
                onChanged={() => query.retry()}
              />
            );
          }

          return (
            <ActivityLogsPanel
              logs={scopedLogs}
              monitors={scopedMonitors}
              vacancies={vacancies}
              subjects={subjects}
              users={users}
              onChanged={() => query.retry()}
            />
          );
        }}
      </QueryResult>
    </>
  );
}
