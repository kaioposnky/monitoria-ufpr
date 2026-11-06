import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader/PageHeader';
export function NotFoundPage() {
  return (
    <>
      <PageHeader
        title="Página não encontrada"
        description="Este endereço não corresponde a uma página disponível."
      />
      <Link className="primary" to="/">
        Voltar ao início
      </Link>
    </>
  );
}
