import { useCallback, useState } from 'react';
import { AdminCatalogPanel } from '../../components/AdminCatalogPanel/AdminCatalogPanel';
import { AdminUsersPanel } from '../../components/AdminUsersPanel/AdminUsersPanel';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { QueryResult } from '../../components/QueryResult/QueryResult';
import {
  loadCourses,
  loadRelations,
  loadSubjects,
} from '../../features/catalog/catalog.api';
import { loadUsers } from '../../features/monitoring/monitoring.api';
import { useQuery } from '../../shared/useQuery';

type AdminTab = 'courses' | 'subjects' | 'links' | 'users';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('courses');

  const loadAdminData = useCallback(async (signal: AbortSignal) => {
    const [courses, subjects, relations, users] = await Promise.all([
      loadCourses(signal),
      loadSubjects(signal),
      loadRelations(signal),
      loadUsers(signal),
    ]);
    return { courses, subjects, relations, users };
  }, []);

  const query = useQuery(loadAdminData);

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'courses', label: 'Cursos' },
    { id: 'subjects', label: 'Matérias' },
    { id: 'links', label: 'Vínculos Curso × Matéria' },
    { id: 'users', label: 'Usuários' },
  ];

  return (
    <>
      <PageHeader
        title="Administração do sistema"
        description="Área exclusiva de administradores para gerenciar cursos, matérias, vínculos acadêmicos e usuários."
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
        {({ courses, subjects, relations, users }) =>
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
              relations={relations}
              onChanged={() => query.retry()}
            />
          )
        }
      </QueryResult>
    </>
  );
}
