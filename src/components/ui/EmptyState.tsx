import { Link } from 'react-router-dom';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  actionTo,
}: EmptyStateProps) => {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
      <h3 className="text-lg font-bold tracking-tight text-gray-900">{title}</h3>
      <p className="mt-2 text-sm font-medium text-gray-600">{description}</p>
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="mt-5 inline-flex">
          <Button>{actionLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
};
