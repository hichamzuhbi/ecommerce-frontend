import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import type { Order } from '../../types/order.types';
import { formatDate, formatOrderRef, formatPrice } from '../../utils/format.utils';

const statusVariant = (status: Order['status']): 'default' | 'success' | 'warning' | 'danger' => {
  if (status === 'DELIVERED' || status === 'PAID') return 'success';
  if (status === 'CANCELLED') return 'danger';
  if (status === 'PENDING' || status === 'PROCESSING') return 'warning';
  return 'default';
};

interface OrderCardProps {
  order: Order;
}

export const OrderCard = ({ order }: OrderCardProps) => {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base font-bold tracking-tight text-gray-900">{formatOrderRef(order.id)}</p>
          <p className="text-sm font-medium text-gray-600">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-lg font-bold text-indigo-600">{formatPrice(order.totalAmount ?? order.total)}</p>
        <Link
          to={`/orders/${order.id}`}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          View Details
        </Link>
      </div>
    </article>
  );
};
