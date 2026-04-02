interface StatusBadgeProps {
  status: string;
}

const styleMap: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-sky-100 text-sky-700',
  SHIPPED: 'bg-emerald-100 text-emerald-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  PAID: 'bg-green-100 text-green-700',
  UNPAID: 'bg-yellow-100 text-yellow-700',
  REFUNDED: 'bg-gray-200 text-gray-700',
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-200 text-gray-700',
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const classes = styleMap[status] ?? 'bg-gray-100 text-gray-700';

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${classes}`}>
      {status}
    </span>
  );
};
