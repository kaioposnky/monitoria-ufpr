import { useCallback, useState } from 'react';
import { AdminCatalogPanel } from '../../components/AdminCatalogPanel/AdminCatalogPanel';
import { AdminUsersPanel } from '../../components/AdminUsersPanel/AdminUsersPanel';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { QueryResult } from '../../components/QueryResult/QueryResult';
import {
  loadCourses,
  loadRelations,
  loadSubjects,
  loadTopics,
} from '../../features/catalog/catalog.api';
import { loadUsers } from '../../features/monitoring/monitoring.api';
import { useQuery } from '../../shared/useQuery';

type AdminTab = 'courses' | 'subjects' | 'topics' | 'links' | 'users';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('courses');

  const loadAdminData = useCallback(async (signal: AbortSignal) => {
    const [courses, subjects, topics, relations, users] = await Promise.all([
      loadCourses(signal),
      loadSubjects(signal),
      loadTopics(signal),
      loadRelations(signal),
      loadUsers(signal),
    ]);
    return { courses, subjects, topics, relations, users };
  }, []);

  const query = useQuery(loadAdminData);

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'courses', label: 'Cursos' },
    { id: 'subjects', label: 'Disciplinas' },
    { id: 'topics', label: 'Matérias' },
    { id: 'links', label: 'Vínculos Curso × Disciplina' },
    { id: 'users', label: 'Usuários' },
  ];

  return (
    <>
      <PageHeader
        title="Administração do sistema"
        description="Área exclusiva de administradores para gerenciar cursos, disciplinas, matérias (1:N), vínculos acadêmicos (N:N) e usuários."
      />
      <div className="tabs" role="tablist" aria-label="Seções administrativas">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className="tab-button"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <QueryResult state={query.state} retry={query.retry}>
        {({ courses, subjects, topics, relations, users }) =>
          activeTab === 'users' ? (
            <AdminUsersPanel
              users={users}
              courses={courses}
              onChanged={() => query.retry()}
            />
          ) : (
            <AdminCatalogPanel
              mode={activeTab}
              courses={courses}
              subjects={subjects}
              topics={topics}
              relations={relations}
              onChanged={() => query.retry()}
            />
          )
        }
      </QueryResult>
    </>
  );
}
