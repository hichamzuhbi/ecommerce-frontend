import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminOrders, useUpdateOrderStatus } from '../../hooks/useAdminOrders';
import type { AdminOrderFilters, Order, OrderStatus } from '../../types/order.types';
import { formatDate, formatOrderRef, formatPrice } from '../../utils/format.utils';
import { getOrderCustomerName } from '../../utils/order.utils';
import { handleImageError, IMAGE_FALLBACK_URL, resolveImageUrl } from '../../utils/image.utils';

const ORDER_STATUSES: Array<OrderStatus> = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

const PAYMENT_STATUSES = ['ALL', 'UNPAID', 'PAID', 'REFUNDED'] as const;

const getOrderTotal = (order: Order) => order.totalAmount ?? order.total;

export const AdminOrdersPage = () => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [rowUpdatingId, setRowUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    search: string;
    status: string;
    paymentStatus: string;
    from: string;
    to: string;
  }>({
    search: '',
    status: 'ALL',
    paymentStatus: 'ALL',
    from: '',
    to: '',
  });

  const queryFilters: AdminOrderFilters = {
    search: filters.search || undefined,
    status: filters.status === 'ALL' ? undefined : (filters.status as OrderStatus),
    paymentStatus:
      filters.paymentStatus === 'ALL'
        ? undefined
        : (filters.paymentStatus as 'PAID' | 'UNPAID' | 'REFUNDED'),
    from: filters.from || undefined,
    to: filters.to || undefined,
  };

  const { data: orders = [], isLoading } = useAdminOrders(queryFilters);
  const { mutateAsync: updateStatus } = useUpdateOrderStatus();

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * 15;
    return orders.slice(start, start + 15);
  }, [orders, page]);

  const totalPages = Math.max(Math.ceil(orders.length / 15), 1);

  const onStatusChange = async (id: string, status: OrderStatus) => {
    setRowUpdatingId(id);
    await updateStatus({ id, status });
    setRowUpdatingId(null);
  };

  const columns = [
    { key: 'id', header: 'Order ID', render: (order: Order) => <span className="font-bold tracking-tight">{formatOrderRef(order.id)}</span> },
    { key: 'customer', header: 'Customer', render: (order: Order) => getOrderCustomerName(order) },
    { key: 'date', header: 'Date', render: (order: Order) => formatDate(order.createdAt) },
    { key: 'items', header: 'Items', render: (order: Order) => order.items.length },
    {
      key: 'total',
      header: 'Total',
      render: (order: Order) => <span className="font-semibold text-indigo-600">{formatPrice(getOrderTotal(order))}</span>,
    },
    {
      key: 'status',
      header: 'Order Status',
      render: (order: Order) => (
        <select
          value={order.status}
          disabled={rowUpdatingId === order.id}
          onChange={(event) => void onStatusChange(order.id, event.target.value as OrderStatus)}
          className="rounded-lg border border-gray-300 px-2 py-1 text-xs"
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (order: Order) => <StatusBadge status={order.paymentStatus} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (order: Order) => (
        <button
          type="button"
          onClick={() => setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600"
        >
          View Details {expandedOrderId === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Orders</h1>

      <section className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-sm lg:grid-cols-5">
        <input
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
          placeholder="Search by ID or customer"
          value={filters.search}
          onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
        />

        <select
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
          value={filters.status}
          onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
        >
          <option value="ALL">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
          value={filters.paymentStatus}
          onChange={(event) => setFilters((prev) => ({ ...prev, paymentStatus: event.target.value }))}
        >
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status === 'ALL' ? 'All payments' : status}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
          value={filters.from}
          onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
        />

        <input
          type="date"
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
          value={filters.to}
          onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
        />
      </section>

      <DataTable
        columns={columns}
        data={paginatedOrders}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        rowKey={(order) => order.id}
      />

      {expandedOrderId
        ? orders
            .filter((order) => order.id === expandedOrderId)
            .map((order) => (
              <section key={order.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">Order Details — {formatOrderRef(order.id)}</h2>
                <div className="mt-3 space-y-2">
                  {order.items.map((item) => (
                    <article key={item.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                      <img
                        src={resolveImageUrl(item.product.imageUrl) || IMAGE_FALLBACK_URL}
                        alt={item.product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                        onError={handleImageError}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty {item.quantity} x {formatPrice(item.product.price)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 p-3 text-sm font-medium text-gray-700">
                  <p>
                    Shipping: {order.shippingAddress.firstName} {order.shippingAddress.lastName}, {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country} {order.shippingAddress.zipCode}
                  </p>
                  <p className="mt-1">Payment Method: {order.paymentMethod}</p>
                </div>
              </section>
            ))
        : null}
    </div>
  );
};
