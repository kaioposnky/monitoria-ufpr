import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import type { Subject, Vacancy } from '../../features/catalog/catalog.types';
import {
  createMonitor,
  deleteMonitor,
  updateMonitor,
} from '../../features/monitoring/monitoring.api';
import {
  formatSubjectLabel,
  MONITOR_STATUS_LABELS,
} from '../../features/monitoring/monitoring.rules';
import {
  MONITOR_STATUSES,
  type Application,
  type MonitorRecord,
  type MonitorStatus,
  type UserSummary,
} from '../../features/monitoring/monitoring.types';
import { errorMessage } from '../../shared/api/http';
import { EmptyState } from '../EmptyState/EmptyState';
import { FormField } from '../FormField/FormField';

type Props = {
  monitors: MonitorRecord[];
  vacancies: Vacancy[];
  subjects: Subject[];
  users: UserSummary[];
  applications: Application[];
  onChanged: () => void;
};

export function MonitorsPanel({
  monitors,
  vacancies,
  subjects,
  users,
  applications,
  onChanged,
}: Props) {
  const { user, refreshUser } = useAuth();
  const canEdit = user?.role === 'PROFESSOR' || user?.role === 'ADMIN';

  const [vacancyId, setVacancyId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('12');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const vacancyById = new Map(vacancies.map((v) => [v.id, v]));
  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const userById = new Map(users.map((u) => [u.id, u]));
  const students = users.filter((u) => u.role === 'ALUNO' && u.active);

  const manageableVacancies =
    user?.role === 'PROFESSOR'
      ? vacancies.filter((v) => v.professorId === user.id)
      : vacancies;

  function renderVacancyName(vId: number): string {
    const v = vacancyById.get(vId);
    if (!v) return `Vaga #${vId}`;
    const s = subjectById.get(v.subjectId);
    return s ? `${formatSubjectLabel(s)} (${v.semester})` : `Vaga #${vId}`;
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!vacancyId || !studentId || !startDate || Number(weeklyHours) < 1) {
      setErrorMsg(
        'Preencha vaga, aluno, carga horária positiva e data de início.',
      );
      return;
    }
    setSubmitting(true);
    try {
      await createMonitor({
        vagaId: Number(vacancyId),
        alunoId: Number(studentId),
        candidaturaId: applicationId ? Number(applicationId) : null,
        cargaHorariaSemanal: Number(weeklyHours),
        dataInicio: startDate,
        dataFim: endDate || null,
      });
      setSuccessMsg('Monitor vinculado com sucesso.');
      setVacancyId('');
      setStudentId('');
      setApplicationId('');
      await refreshUser();
      onChanged();
    } catch (error) {
      setErrorMsg(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(
    monitor: MonitorRecord,
    nextStatus: MonitorStatus,
  ) {
    setErrorMsg(null);
    setSuccessMsg(null);
    setBusyId(monitor.id);
    try {
      await updateMonitor(monitor.id, {
        candidaturaId: monitor.applicationId,
        cargaHorariaSemanal: monitor.weeklyHours,
        status: nextStatus,
        dataInicio: monitor.startDate,
        dataFim: monitor.endDate,
      });
      setSuccessMsg(`Status do monitor #${monitor.id} atualizado.`);
      await refreshUser();
      onChanged();
    } catch (error) {
      setErrorMsg(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    setErrorMsg(null);
    setSuccessMsg(null);
    setBusyId(id);
    try {
      await deleteMonitor(id);
      setSuccessMsg(`Vínculo de monitor #${id} removido.`);
      await refreshUser();
      onChanged();
    } catch (error) {
      setErrorMsg(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="stack-actions">
      {errorMsg && (
        <p className="notice error" role="alert">
          {errorMsg}
        </p>
      )}
      {successMsg && (
        <p className="notice success" role="status">
          {successMsg}
        </p>
      )}

      {canEdit && (
        <form className="panel" onSubmit={handleCreate} noValidate>
          <h2>Vincular novo monitor</h2>
          <div className="form-grid">
            <FormField label="Vaga de monitoria (obrigatório)">
              <select
                value={vacancyId}
                onChange={(e) => setVacancyId(e.target.value)}
                required
              >
                <option value="">Selecione a vaga</option>
                {manageableVacancies.map((v) => (
                  <option key={v.id} value={v.id}>
                    #{v.id} · {renderVacancyName(v.id)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Aluno (obrigatório)">
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              >
                <option value="">Selecione o aluno</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.registration || s.email})
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Candidatura de origem (opcional)">
              <select
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
              >
                <option value="">Sem vínculo direto</option>
                {applications
                  .filter(
                    (a) =>
                      (!vacancyId || a.vacancyId === Number(vacancyId)) &&
                      (!studentId || a.studentId === Number(studentId)),
                  )
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      Candidatura #{a.id} ({a.status})
                    </option>
                  ))}
              </select>
            </FormField>
            <FormField label="Carga horária semanal (h)">
              <input
                type="number"
                min="1"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Data de início (obrigatório)">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Data de término (opcional)">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormField>
          </div>
          <div className="form-actions">
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Vinculando...' : 'Efetivar monitor'}
            </button>
          </div>
        </form>
      )}

      {monitors.length === 0 ? (
        <EmptyState
          title="Nenhum vínculo de monitoria encontrado"
          description="Não há monitores registrados para o seu perfil."
        />
      ) : (
        <div className="table-wrap">
          <table>
            <caption>Monitores cadastrados</caption>
            <thead>
              <tr>
                <th>ID</th>
                <th>Aluno</th>
                <th>Vaga / Disciplina</th>
                <th>Carga</th>
                <th>Período</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {monitors.map((monitor) => {
                const student = userById.get(monitor.studentId);
                return (
                  <tr key={monitor.id}>
                    <td>#{monitor.id}</td>
                    <td>
                      {student?.name ??
                        (user && user.id === monitor.studentId
                          ? user.name
                          : `Aluno #${monitor.studentId}`)}
                    </td>
                    <td>{renderVacancyName(monitor.vacancyId)}</td>
                    <td>{monitor.weeklyHours}h/sem</td>
                    <td>
                      {monitor.startDate}
                      {monitor.endDate ? ` até ${monitor.endDate}` : ''}
                    </td>
                    <td>
                      {canEdit ? (
                        <select
                          aria-label={`Status do monitor ${monitor.id}`}
                          value={monitor.status}
                          disabled={busyId === monitor.id}
                          onChange={(e) =>
                            handleStatusChange(
                              monitor,
                              e.target.value as MonitorStatus,
                            )
                          }
                        >
                          {MONITOR_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {MONITOR_STATUS_LABELS[st]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="badge">
                          {MONITOR_STATUS_LABELS[monitor.status]}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="inline-actions">
                        <Link
                          className="button-link compact-button"
                          to="/office-hours"
                        >
                          Horários
                        </Link>
                        {canEdit && (
                          <button
                            type="button"
                            className="danger compact-button"
                            disabled={busyId === monitor.id}
                            onClick={() => handleDelete(monitor.id)}
                          >
                            Remover
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
      )}
    </div>
  );
}
