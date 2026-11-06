import { Link } from 'react-router-dom';
type Props = {
  to: string;
  title: string;
  description: string;
  status?: string;
};
export function NavigationCard({ to, title, description, status }: Props) {
  return (
    <Link className="card" to={to}>
      {status && <span className="badge">{status}</span>}
      <strong>{title}</strong>
      <span>{description}</span>
    </Link>
  );
}
