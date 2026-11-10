import { useState, type FormEvent } from 'react';
import type {
  Course,
  CourseSubject,
  Subject,
} from '../../features/catalog/catalog.types';
import {
  createCourse,
  createSubject,
  deleteCourse,
  deleteSubject,
  linkCourseSubject,
  unlinkCourseSubject,
  updateCourse,
  updateSubject,
} from '../../features/monitoring/monitoring.api';
import { errorMessage } from '../../shared/api/http';
import { EmptyState } from '../EmptyState/EmptyState';
import { FormField } from '../FormField/FormField';

type Props = {
  mode: 'courses' | 'subjects' | 'links';
  courses: Course[];
  subjects: Subject[];
  relations: CourseSubject[];
  onChanged: () => void;
};

export function AdminCatalogPanel({
  mode,
  courses,
  subjects,
  relations,
  onChanged,
}: Props) {
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseSector, setCourseSector] = useState('');

  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectDept, setSubjectDept] = useState('');

  const [linkCourseId, setLinkCourseId] = useState('');
  const [linkSubjectId, setLinkSubjectId] = useState('');

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const courseById = new Map(courses.map((c) => [c.id, c]));
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  function resetCourseForm() {
    setEditingCourseId(null);
    setCourseCode('');
    setCourseName('');
    setCourseSector('');
  }

  function resetSubjectForm() {
    setEditingSubjectId(null);
    setSubjectCode('');
    setSubjectName('');
    setSubjectDept('');
  }

  async function handleSaveCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!courseCode.trim() || !courseName.trim()) {
      setErrorMsg('Informe o código e o nome do curso.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        codigo: courseCode.trim().toUpperCase(),
        nome: courseName.trim(),
        setor: courseSector.trim() || null,
      };
      if (editingCourseId !== null) {
        await updateCourse(editingCourseId, payload);
        setSuccessMsg('Curso atualizado com sucesso.');
      } else {
        await createCourse(payload);
        setSuccessMsg('Curso cadastrado com sucesso.');
      }
      resetCourseForm();
      onChanged();
    } catch (error) {
      setErrorMsg(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteCourse(id: number) {
    setErrorMsg(null);
    setSuccessMsg(null);
    setBusy(true);
    try {
      await deleteCourse(id);
      setSuccessMsg(`Curso #${id} removido.`);
      if (editingCourseId === id) resetCourseForm();
      onChanged();
    } catch (error) {
      setErrorMsg(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!subjectCode.trim() || !subjectName.trim() || !subjectDept.trim()) {
      setErrorMsg('Informe código, nome e departamento da matéria.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        codigo: subjectCode.trim().toUpperCase(),
        nome: subjectName.trim(),
        departamento: subjectDept.trim(),
      };
      if (editingSubjectId !== null) {
        await updateSubject(editingSubjectId, payload);
        setSuccessMsg('Matéria atualizada com sucesso.');
      } else {
        await createSubject(payload);
        setSuccessMsg('Matéria cadastrada com sucesso.');
      }
      resetSubjectForm();
      onChanged();
    } catch (error) {
      setErrorMsg(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteSubject(id: number) {
    setErrorMsg(null);
    setSuccessMsg(null);
    setBusy(true);
    try {
      await deleteSubject(id);
      setSuccessMsg(`Matéria #${id} removida.`);
      if (editingSubjectId === id) resetSubjectForm();
      onChanged();
    } catch (error) {
      setErrorMsg(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!linkCourseId || !linkSubjectId) {
      setErrorMsg('Selecione o curso e a matéria para vincular.');
      return;
    }
    setBusy(true);
    try {
      await linkCourseSubject(Number(linkCourseId), Number(linkSubjectId));
      setSuccessMsg('Vínculo curso × matéria criado com sucesso.');
      setLinkCourseId('');
      setLinkSubjectId('');
      onChanged();
    } catch (error) {
      setErrorMsg(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleUnlink(courseId: number, subjectId: number) {
    setErrorMsg(null);
    setSuccessMsg(null);
    setBusy(true);
    try {
      await unlinkCourseSubject(courseId, subjectId);
      setSuccessMsg('Vínculo removido com sucesso.');
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

      {mode === 'courses' && (
        <>
          <form className="panel" onSubmit={handleSaveCourse} noValidate>
            <h2>
              {editingCourseId !== null
                ? `Editar curso #${editingCourseId}`
                : 'Cadastrar curso'}
            </h2>
            <div className="form-grid">
              <FormField label="Código (obrigatório)">
                <input
                  type="text"
                  placeholder="BCC"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Nome do curso (obrigatório)">
                <input
                  type="text"
                  placeholder="Bacharelado em Ciência da Computação"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Setor (opcional)">
                <input
                  type="text"
                  placeholder="Setor de Ciências Exatas"
                  value={courseSector}
                  onChange={(e) => setCourseSector(e.target.value)}
                />
              </FormField>
            </div>
            <div className="form-actions">
              <button type="submit" className="primary" disabled={busy}>
                {editingCourseId !== null ? 'Salvar curso' : 'Criar curso'}
              </button>
              {editingCourseId !== null && (
                <button
                  type="button"
                  className="secondary"
                  onClick={resetCourseForm}
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>

          {courses.length === 0 ? (
            <EmptyState
              title="Nenhum curso cadastrado"
              description="Cadastre o primeiro curso acima."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <caption>Cursos cadastrados</caption>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Setor</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>{course.code}</td>
                      <td>{course.name}</td>
                      <td>{course.sector ?? '—'}</td>
                      <td>
                        <div className="inline-actions">
                          <button
                            type="button"
                            className="secondary compact-button"
                            onClick={() => {
                              setEditingCourseId(course.id);
                              setCourseCode(course.code);
                              setCourseName(course.name);
                              setCourseSector(course.sector ?? '');
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="danger compact-button"
                            disabled={busy}
                            onClick={() => handleDeleteCourse(course.id)}
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
        </>
      )}

      {mode === 'subjects' && (
        <>
          <form className="panel" onSubmit={handleSaveSubject} noValidate>
            <h2>
              {editingSubjectId !== null
                ? `Editar matéria #${editingSubjectId}`
                : 'Cadastrar matéria'}
            </h2>
            <div className="form-grid">
              <FormField label="Código (obrigatório)">
                <input
                  type="text"
                  placeholder="CI1055"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Nome da matéria (obrigatório)">
                <input
                  type="text"
                  placeholder="Algoritmos e Estruturas de Dados 1"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Departamento (obrigatório)">
                <input
                  type="text"
                  placeholder="DInf - Departamento de Informática"
                  value={subjectDept}
                  onChange={(e) => setSubjectDept(e.target.value)}
                  required
                />
              </FormField>
            </div>
            <div className="form-actions">
              <button type="submit" className="primary" disabled={busy}>
                {editingSubjectId !== null
                  ? 'Salvar matéria'
                  : 'Criar matéria'}
              </button>
              {editingSubjectId !== null && (
                <button
                  type="button"
                  className="secondary"
                  onClick={resetSubjectForm}
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>

          {subjects.length === 0 ? (
            <EmptyState
              title="Nenhuma matéria cadastrada"
              description="Cadastre a primeira matéria acima."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <caption>Matérias cadastradas</caption>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Departamento</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id}>
                      <td>{subject.code}</td>
                      <td>{subject.name}</td>
                      <td>{subject.department ?? '—'}</td>
                      <td>
                        <div className="inline-actions">
                          <button
                            type="button"
                            className="secondary compact-button"
                            onClick={() => {
                              setEditingSubjectId(subject.id);
                              setSubjectCode(subject.code);
                              setSubjectName(subject.name);
                              setSubjectDept(subject.department ?? '');
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="danger compact-button"
                            disabled={busy}
                            onClick={() => handleDeleteSubject(subject.id)}
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
        </>
      )}

      {mode === 'links' && (
        <>
          <form className="panel" onSubmit={handleCreateLink} noValidate>
            <h2>Vincular matéria a curso</h2>
            <div className="form-grid">
              <FormField label="Curso (obrigatório)">
                <select
                  value={linkCourseId}
                  onChange={(e) => setLinkCourseId(e.target.value)}
                  required
                >
                  <option value="">Selecione um curso</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Matéria (obrigatório)">
                <select
                  value={linkSubjectId}
                  onChange={(e) => setLinkSubjectId(e.target.value)}
                  required
                >
                  <option value="">Selecione uma matéria</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <div className="form-actions">
              <button type="submit" className="primary" disabled={busy}>
                Vincular
              </button>
            </div>
          </form>

          {relations.length === 0 ? (
            <EmptyState
              title="Nenhum vínculo cadastrado"
              description="Associe matérias aos cursos acima."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <caption>Matriz Curso × Matéria</caption>
                <thead>
                  <tr>
                    <th>Curso</th>
                    <th>Matéria</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {relations.map((rel) => {
                    const c = courseById.get(rel.courseId);
                    const s = subjectById.get(rel.subjectId);
                    return (
                      <tr key={`${rel.courseId}-${rel.subjectId}`}>
                        <td>
                          {c ? `${c.code} — ${c.name}` : `Curso #${rel.courseId}`}
                        </td>
                        <td>
                          {s
                            ? `${s.code} — ${s.name}`
                            : `Matéria #${rel.subjectId}`}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="danger compact-button"
                            disabled={busy}
                            onClick={() =>
                              handleUnlink(rel.courseId, rel.subjectId)
                            }
                          >
                            Desvincular
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
