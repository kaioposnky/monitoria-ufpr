import { MonitorReviewForm } from '../../components/MonitorReviewForm/MonitorReviewForm';
import { PageHeader } from '../../components/PageHeader/PageHeader';

export function MonitorReviewPage() {
  return (
    <>
      <PageHeader
        title="Revisar monitor ou candidatura"
        description="Prepare uma decisão de aprovação ou reprovação para uma candidatura. O registro depende de integração futura."
      />
      <MonitorReviewForm />
    </>
  );
}
