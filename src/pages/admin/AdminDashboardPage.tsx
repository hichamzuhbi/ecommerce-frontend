import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react';
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Link } from 'react-router-dom';
import { KpiCard } from '../../components/admin/KpiCard';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Spinner } from '../../components/ui/Spinner';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { formatDate, formatOrderRef, formatPrice } from '../../utils/format.utils';
import { getOrderCustomerName } from '../../utils/order.utils';

const PIE_COLORS = ['#fbbf24', '#38bdf8', '#0f766e', '#22c55e', '#64748b', '#ef4444'];
const PIE_DOT_CLASSES = [
  'bg-yellow-400',
  'bg-sky-400',
  'bg-teal-700',
  'bg-green-500',
  'bg-slate-500',
  'bg-red-500',
];

const toOrderTotal = (total: number, totalAmount?: number) => totalAmount ?? total;

export const AdminDashboardPage = () => {
  const {
    isLoading,
    isError,
    metrics,
    revenueSeries,
    statusSeries,
    recentOrders,
    lowStockProducts,
  } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
        <h1 className="text-lg font-bold">Could not load dashboard data</h1>
        <p className="mt-1 text-sm font-medium">
          Check backend admin endpoints and try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-4">
        <KpiCard
          title="Total Revenue"
          value={formatPrice(metrics.totalRevenue)}
          icon={DollarSign}
          iconClassName="bg-green-100 text-green-600"
        />
        <KpiCard
          title="Total Orders"
          value={String(metrics.totalOrders)}
          icon={ShoppingBag}
          iconClassName="bg-sky-100 text-sky-600"
        />
        <KpiCard
          title="Total Products"
          value={String(metrics.totalProducts)}
          icon={Package}
          iconClassName="bg-slate-100 text-slate-600"
        />
        <KpiCard
          title="Total Customers"
          value={String(metrics.totalCustomers)}
          icon={Users}
          iconClassName="bg-yellow-100 text-yellow-600"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <article className="h-[320px] rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Revenue Over Time (7 days)</h2>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={revenueSeries}>
              <Tooltip formatter={(value: number) => formatPrice(value)} />
              <Area type="monotone" dataKey="amount" stroke="#4f46e5" fill="#e0e7ff" />
            </AreaChart>
          </ResponsiveContainer>
        </article>

        <article className="h-[320px] rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Orders by Status</h2>
          <ResponsiveContainer width="100%" height="70%">
            <PieChart>
              <Pie data={statusSeries} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                {statusSeries.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap gap-2">
            {statusSeries.map((status, index) => (
              <span key={status.name} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600">
                <span className={`h-2 w-2 rounded-full ${PIE_DOT_CLASSES[index % PIE_DOT_CLASSES.length]}`} />
                {status.name}: {status.value}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-bold uppercase text-gray-500">
                <th className="px-2 py-2">Order ID</th>
                <th className="px-2 py-2">Customer</th>
                <th className="px-2 py-2">Date</th>
                <th className="px-2 py-2">Total</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100">
                  <td className="px-2 py-3 text-sm font-bold tracking-tight text-gray-700">{formatOrderRef(order.id)}</td>
                  <td className="px-2 py-3 text-sm font-medium text-gray-700">{getOrderCustomerName(order)}</td>
                  <td className="px-2 py-3 text-sm font-medium text-gray-700">{formatDate(order.createdAt)}</td>
                  <td className="px-2 py-3 text-sm font-semibold text-sky-600">
                    {formatPrice(toOrderTotal(order.total, order.totalAmount))}
                  </td>
                  <td className="px-2 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-2 py-3">
                    <Link to="/admin/orders" className="text-sm font-semibold text-sky-600 hover:text-sky-700">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Low Stock Alert</h2>
        {lowStockProducts.length === 0 ? (
          <p className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">
            All products well stocked.
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-3">
            {lowStockProducts.map((product) => (
              <article key={product.id} className="rounded-xl border border-yellow-200 bg-yellow-50 p-3">
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-sm font-medium text-yellow-700">Stock: {product.stock}</p>
                <Link to={`/admin/products/${product.id}/edit`} className="mt-2 inline-block text-sm font-semibold text-sky-600">
                  Edit
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
