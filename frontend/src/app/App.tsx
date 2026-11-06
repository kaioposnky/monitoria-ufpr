import { Route, Routes, useLocation } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout/AppLayout';
import { HomePage } from '../pages/HomePage/HomePage';
import { CoursesPage } from '../pages/CoursesPage/CoursesPage';
import { SubjectsPage } from '../pages/SubjectsPage/SubjectsPage';
import { CourseSubjectsPage } from '../pages/CourseSubjectsPage/CourseSubjectsPage';
import { VacanciesPage } from '../pages/VacanciesPage/VacanciesPage';
import { VacancyDetailsPage } from '../pages/VacancyDetailsPage/VacancyDetailsPage';
import { ApplicationPage } from '../pages/ApplicationPage/ApplicationPage';
import { NewVacancyPage } from '../pages/NewVacancyPage/NewVacancyPage';
import { OfficeHoursPage } from '../pages/OfficeHoursPage/OfficeHoursPage';
import { MonitorReviewPage } from '../pages/MonitorReviewPage/MonitorReviewPage';
import { ManagementPage } from '../pages/ManagementPage/ManagementPage';
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage';

export function App() {
  const { pathname, search } = useLocation();
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="course-subjects" element={<CourseSubjectsPage />} />
        <Route path="monitoring-vacancies" element={<VacanciesPage />} />
        <Route
          path="monitoring-vacancies/:id"
          element={<VacancyDetailsPage key={pathname} />}
        />
        <Route
          path="applications/new"
          element={<ApplicationPage key={search} />}
        />
        <Route path="office-hours" element={<OfficeHoursPage />} />
        <Route path="management" element={<ManagementPage />} />
        <Route path="management/vacancies/new" element={<NewVacancyPage />} />
        <Route
          path="management/monitors/review"
          element={<MonitorReviewPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
