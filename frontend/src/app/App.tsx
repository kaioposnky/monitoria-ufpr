import { Route, Routes, useLocation } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout/AppLayout';
import { RequireAuth } from '../components/RequireAuth/RequireAuth';
import { AdminPage } from '../pages/AdminPage/AdminPage';
import { ApplicationPage } from '../pages/ApplicationPage/ApplicationPage';
import { CourseSubjectsPage } from '../pages/CourseSubjectsPage/CourseSubjectsPage';
import { CoursesPage } from '../pages/CoursesPage/CoursesPage';
import { HomePage } from '../pages/HomePage/HomePage';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { ManagementPage } from '../pages/ManagementPage/ManagementPage';
import { MonitorReviewPage } from '../pages/MonitorReviewPage/MonitorReviewPage';
import { NewVacancyPage } from '../pages/NewVacancyPage/NewVacancyPage';
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage';
import { OfficeHoursPage } from '../pages/OfficeHoursPage/OfficeHoursPage';
import { SubjectsPage } from '../pages/SubjectsPage/SubjectsPage';
import { VacanciesPage } from '../pages/VacanciesPage/VacanciesPage';
import { VacancyDetailsPage } from '../pages/VacancyDetailsPage/VacancyDetailsPage';

export function App() {
  const { pathname, search } = useLocation();
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="course-subjects" element={<CourseSubjectsPage />} />
        <Route path="monitoring-vacancies" element={<VacanciesPage />} />
        <Route
          path="monitoring-vacancies/:id"
          element={<VacancyDetailsPage key={pathname} />}
        />
        <Route path="office-hours" element={<OfficeHoursPage />} />
        <Route
          path="applications/new"
          element={
            <RequireAuth roles={['ALUNO', 'ADMIN']}>
              <ApplicationPage key={search} />
            </RequireAuth>
          }
        />
        <Route
          path="management"
          element={
            <RequireAuth>
              <ManagementPage />
            </RequireAuth>
          }
        />
        <Route
          path="management/vacancies/new"
          element={
            <RequireAuth roles={['PROFESSOR', 'ADMIN']}>
              <NewVacancyPage />
            </RequireAuth>
          }
        />
        <Route
          path="management/monitors/review"
          element={
            <RequireAuth roles={['PROFESSOR', 'ADMIN']}>
              <MonitorReviewPage />
            </RequireAuth>
          }
        />
        <Route
          path="admin"
          element={
            <RequireAuth roles={['ADMIN']}>
              <AdminPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
