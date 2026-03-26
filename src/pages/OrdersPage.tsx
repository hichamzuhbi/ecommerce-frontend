import { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { OrderCard } from '../components/orders/OrderCard';
import { useOrders } from '../hooks/useOrders';

export const OrdersPage = () => {
  const [search, setSearch] = useState('');
  const { data: orders = [], isLoading } = useOrders();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar search={search} onSearchChange={setSearch} />
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar search={search} onSearchChange={setSearch} />
      <PageWrapper>
        <section className="space-y-4 py-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Orders</h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Track all your purchases, delivery updates, and order history in one place.
            </p>
          </div>

          {orders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Once you place an order it will appear here."
              actionLabel="Start Shopping"
              actionTo="/home"
            />
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>
      </PageWrapper>
    </main>
  );
};
