type Props = { title: string; description: string };
export function EmptyState({ title, description }: Props) {
  return (
    <section className="panel empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
