import { useState, type FormEvent } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import type { Subject, Vacancy } from '../../features/catalog/catalog.types';
import {
  approveActivityLog,
  createActivityLog,
  deleteActivityLog,
} from '../../features/monitoring/monitoring.api';
import {
  ACTIVITY_APPROVAL_LABELS,
  ACTIVITY_TYPE_LABELS,
  formatSubjectLabel,
  formatTimeShort,
  isEndAfterStart,
  isNonNegativeInteger,
  isValidTime,
} from '../../features/monitoring/monitoring.rules';
import {
  ACTIVITY_TYPES,
  type ActivityApprovalStatus,
  type ActivityLogRecord,
  type ActivityType,
  type MonitorRecord,
  type UserSummary,
} from '../../features/monitoring/monitoring.types';
import { errorMessage } from '../../shared/api/http';
import { EmptyState } from '../EmptyState/EmptyState';
import { FormField } from '../FormField/FormField';

type Props = {
  logs: ActivityLogRecord[];
  monitors: MonitorRecord[];
  vacancies: Vacancy[];
  subjects: Subject[];
  users: UserSummary[];
  onChanged: () => void;
};

export function ActivityLogsPanel({
  logs,
  monitors,
  vacancies,
  subjects,
  users,
  onChanged,
}: Props) {
  const { user } = useAuth();
  const canApprove = user?.role === 'PROFESSOR' || user?.role === 'ADMIN';
  const activeMonitors = monitors.filter((m) => m.status === 'ATIVO');
  const canCreate = Boolean(
    user &&
    (user.role === 'ADMIN' ||
      user.role === 'PROFESSOR' ||
      (user.role === 'ALUNO' && activeMonitors.length > 0)),
  );

  const [monitorId, setMonitorId] = useState(() =>
    activeMonitors.length === 1 ? String(activeMonitors[0].id) : '',
  );
  const [activityDate, setActivityDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>(
    'ATENDIMENTO_DUVIDAS',
  );
  const [studentsHelped, setStudentsHelped] = useState('0');
  const [description, setDescription] = useState('');
  const [feedbackByLog, setFeedbackByLog] = useState<Record<number, string>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const monitorById = new Map(monitors.map((m) => [m.id, m]));
  const vacancyById = new Map(vacancies.map((v) => [v.id, v]));
  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const userById = new Map(users.map((u) => [u.id, u]));

  function formatMonitorLabel(mId: number): string {
    const m = monitorById.get(mId);
    if (!m) return `Monitor #${mId}`;
    const v = vacancyById.get(m.vacancyId);
    const s = v ? subjectById.get(v.subjectId) : undefined;
    const student = userById.get(m.studentId);
    const subjectText = s ? formatSubjectLabel(s) : `Vaga #${m.vacancyId}`;
    const studentText =
      student?.name ??
      (user && user.id === m.studentId ? user.name : `Aluno #${m.studentId}`);
    return `#${m.id} · ${studentText} · ${subjectText}`;
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (
      !monitorId ||
      !activityDate ||
      !isValidTime(startTime) ||
      !isEndAfterStart(startTime, endTime) ||
      !description.trim() ||
      !isNonNegativeInteger(studentsHelped)
    ) {
      setErrorMsg(
        'Preencha monitor, data, horário final posterior ao inicial, quantidade de alunos (>= 0) e descrição.',
      );
      return;
    }
    setSubmitting(true);
    try {
      await createActivityLog({
        monitorId: Number(monitorId),
        dataAtividade: activityDate,
        horaInicio: startTime,
        horaFim: endTime,
        tipoAtividade: activityType,
        descricao: description.trim(),
        quantidadeAlunosAtendidos: Number(studentsHelped),
      });
      setSuccessMsg('Registro de atividade enviado com sucesso.');
      setStartTime('');
      setEndTime('');
      setStudentsHelped('0');
      setDescription('');
      onChanged();
    } catch (error) {
      setErrorMsg(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApproval(id: number, status: ActivityApprovalStatus) {
    setErrorMsg(null);
    setSuccessMsg(null);
    setBusyId(id);
    try {
      await approveActivityLog(id, {
        statusAprovacao: status,
        feedbackProfessor: feedbackByLog[id]?.trim() || null,
      });
      setSuccessMsg(`Registro #${id} marcado como ${status}.`);
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
      await deleteActivityLog(id);
      setSuccessMsg(`Registro #${id} removido.`);
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

      {canCreate && (
        <form className="panel" onSubmit={handleCreate} noValidate>
          <h2>Registrar atividade de monitoria</h2>
          <div className="form-grid">
            <FormField label="Monitoria (obrigatório)">
              <select
                value={monitorId}
                onChange={(e) => setMonitorId(e.target.value)}
                required
              >
                <option value="">Selecione a monitoria</option>
                {activeMonitors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {formatMonitorLabel(m.id)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Data da atividade (obrigatório)">
              <input
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Hora inicial (obrigatório)">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Hora final (obrigatório)">
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Tipo de atividade (obrigatório)">
              <select
                value={activityType}
                onChange={(e) =>
                  setActivityType(e.target.value as ActivityType)
                }
              >
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {ACTIVITY_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Alunos atendidos">
              <input
                type="number"
                min="0"
                step="1"
                value={studentsHelped}
                onChange={(e) => setStudentsHelped(e.target.value)}
              />
            </FormField>
            <FormField label="Descrição da atividade (obrigatório)">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </FormField>
          </div>
          <div className="form-actions">
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Registrando...' : 'Registrar atividade'}
            </button>
          </div>
        </form>
      )}

      {logs.length === 0 ? (
        <EmptyState
          title="Nenhum registro de atividade"
          description="Não há registros de horas ou atividades para exibir."
        />
      ) : (
        <div className="table-wrap">
          <table>
            <caption>Registros de atividades de monitoria</caption>
            <thead>
              <tr>
                <th>Monitoria</th>
                <th>Data e horário</th>
                <th>Tipo e descrição</th>
                <th>Alunos</th>
                <th>Aprovação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatMonitorLabel(log.monitorId)}</td>
                  <td>
                    {log.activityDate}
                    <br />
                    <small className="muted">
                      {formatTimeShort(log.startTime)} –{' '}
                      {formatTimeShort(log.endTime)}
                    </small>
                  </td>
                  <td>
                    <strong>{ACTIVITY_TYPE_LABELS[log.type]}</strong>
                    <p className="multiline">{log.description}</p>
                    {log.professorFeedback && (
                      <small className="muted">
                        Parecer: {log.professorFeedback}
                      </small>
                    )}
                  </td>
                  <td>{log.studentsHelped}</td>
                  <td>
                    <span className="badge">
                      {ACTIVITY_APPROVAL_LABELS[log.approvalStatus]}
                    </span>
                  </td>
                  <td>
                    <div className="stack-actions">
                      {canApprove && (
                        <>
                          <input
                            type="text"
                            aria-label={`Parecer para registro ${log.id}`}
                            placeholder="Parecer opcional"
                            value={
                              feedbackByLog[log.id] ??
                              log.professorFeedback ??
                              ''
                            }
                            onChange={(e) =>
                              setFeedbackByLog((prev) => ({
                                ...prev,
                                [log.id]: e.target.value,
                              }))
                            }
                          />
                          <div className="inline-actions">
                            <button
                              type="button"
                              className="compact-button"
                              disabled={busyId === log.id}
                              onClick={() => handleApproval(log.id, 'APROVADO')}
                            >
                              Aprovar
                            </button>
                            <button
                              type="button"
                              className="secondary compact-button"
                              disabled={busyId === log.id}
                              onClick={() =>
                                handleApproval(log.id, 'REJEITADO')
                              }
                            >
                              Rejeitar
                            </button>
                          </div>
                        </>
                      )}
                      <button
                        type="button"
                        className="danger compact-button"
                        disabled={busyId === log.id}
                        onClick={() => handleDelete(log.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
