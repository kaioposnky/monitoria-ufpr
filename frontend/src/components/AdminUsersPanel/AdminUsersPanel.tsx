import { useState, type FormEvent } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import type { UserRole } from '../../features/auth/auth.types';
import type { Course } from '../../features/catalog/catalog.types';
import {
  createUser,
  deleteUser,
  updateUser,
} from '../../features/monitoring/monitoring.api';
import { USER_ROLE_LABELS } from '../../features/monitoring/monitoring.rules';
import type { UserSummary } from '../../features/monitoring/monitoring.types';
import { errorMessage } from '../../shared/api/http';
import { EmptyState } from '../EmptyState/EmptyState';
import { FormField } from '../FormField/FormField';

type Props = {
  users: UserSummary[];
  courses: Course[];
  onChanged: () => void;
};

const ROLES: UserRole[] = ['ALUNO', 'PROFESSOR', 'ADMIN'];

export function AdminUsersPanel({ users, courses, onChanged }: Props) {
  const { user: currentUser } = useAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('ALUNO');
  const [registration, setRegistration] = useState('');
  const [courseId, setCourseId] = useState('');
  const [active, setActive] = useState(true);
  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const courseById = new Map(courses.map((c) => [c.id, c]));

  function resetForm() {
    setEditingId(null);
    setName('');
    setEmail('');
    setRole('ALUNO');
    setRegistration('');
    setCourseId('');
    setActive(true);
    setPassword('');
  }

  function startEdit(u: UserSummary) {
    setEditingId(u.id);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setRegistration(u.registration ?? '');
    setCourseId(u.courseId ? String(u.courseId) : '');
    setActive(u.active);
    setPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Informe o nome e o e-mail do usuário.');
      return;
    }
    if (editingId === null && password.length < 6) {
      setErrorMsg('A senha inicial deve ter ao menos 6 caracteres.');
      return;
    }
    if (editingId !== null && password.length > 0 && password.length < 6) {
      setErrorMsg('A nova senha deve ter ao menos 6 caracteres.');
      return;
    }

    setBusy(true);
    try {
      if (editingId !== null) {
        await updateUser(editingId, {
          nome: name.trim(),
          email: email.trim(),
          tipoUsuario: role,
          matricula: registration.trim() || null,
          cursoId: courseId ? Number(courseId) : null,
          ativo: active,
          ...(password ? { senha: password } : {}),
        });
        setSuccessMsg(`Usuário #${editingId} atualizado.`);
      } else {
        await createUser({
          nome: name.trim(),
          email: email.trim(),
          tipoUsuario: role,
          matricula: registration.trim() || null,
          cursoId: courseId ? Number(courseId) : null,
          senha: password,
        });
        setSuccessMsg('Usuário cadastrado com sucesso.');
      }
      resetForm();
      onChanged();
    } catch (error) {
      setErrorMsg(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    setErrorMsg(null);
    setSuccessMsg(null);
    setBusy(true);
    try {
      await deleteUser(id);
      setSuccessMsg(`Usuário #${id} excluído.`);
      if (editingId === id) resetForm();
      onChanged();
    } catch (error) {
      setErrorMsg(errorMessage(error));
    } finally {
      setBusy(false);
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

      <form className="panel" onSubmit={handleSubmit} noValidate>
        <h2>
          {editingId !== null
            ? `Editar usuário #${editingId}`
            : 'Cadastrar novo usuário'}
        </h2>
        <div className="form-grid">
          <FormField label="Nome completo (obrigatório)">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormField>
          <FormField label="E-mail institucional (obrigatório)">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Perfil (obrigatório)">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {USER_ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Matrícula / SIAPE (opcional)">
            <input
              type="text"
              placeholder="GRR20260001 ou SIAPE123456"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
            />
          </FormField>
          <FormField label="Curso (opcional)">
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">Sem curso vinculado</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label={
              editingId !== null
                ? 'Nova senha (opcional)'
                : 'Senha inicial (obrigatório)'
            }
            hint="Mínimo de 6 caracteres."
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={editingId === null}
            />
          </FormField>
          {editingId !== null && (
            <FormField label="Situação da conta">
              <select
                value={active ? 'true' : 'false'}
                onChange={(e) => setActive(e.target.value === 'true')}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </FormField>
          )}
        </div>
        <div className="form-actions">
          <button type="submit" className="primary" disabled={busy}>
            {editingId !== null ? 'Salvar usuário' : 'Cadastrar usuário'}
          </button>
          {editingId !== null && (
            <button type="button" className="secondary" onClick={resetForm}>
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      {users.length === 0 ? (
        <EmptyState
          title="Nenhum usuário cadastrado"
          description="Cadastre o primeiro usuário acima."
        />
      ) : (
        <div className="table-wrap">
          <table>
            <caption>Usuários do sistema</caption>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome e e-mail</th>
                <th>Perfil</th>
                <th>Matrícula / Curso</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const course = u.courseId ? courseById.get(u.courseId) : null;
                return (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td>
                      <strong>{u.name}</strong>
                      <br />
                      <small className="muted">{u.email}</small>
                    </td>
                    <td>
                      <span className="badge">{USER_ROLE_LABELS[u.role]}</span>
                    </td>
                    <td>
                      {u.registration ?? '—'}
                      {course ? ` · ${course.code}` : ''}
                    </td>
                    <td>{u.active ? 'Ativo' : 'Inativo'}</td>
                    <td>
                      <div className="inline-actions">
                        <button
                          type="button"
                          className="secondary compact-button"
                          onClick={() => startEdit(u)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="danger compact-button"
                          disabled={busy || currentUser?.id === u.id}
                          onClick={() => handleDelete(u.id)}
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
