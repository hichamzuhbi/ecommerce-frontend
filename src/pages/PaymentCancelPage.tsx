import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

const resolveOrderId = (searchParams: URLSearchParams): string => {
  return (
    searchParams.get('orderId') ||
    localStorage.getItem('latestOrderId') ||
    ''
  );
};

export const PaymentCancelPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = useMemo(() => resolveOrderId(searchParams), [searchParams]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar search="" onSearchChange={() => undefined} />
      <PageWrapper>
        <section className="mx-auto max-w-3xl space-y-6 py-10">
          <EmptyState
            title="Payment canceled"
            description="You can retry the payment from your order page when you are ready."
          />
          <div className="flex flex-wrap gap-3">
            {orderId ? (
              <Link to={`/orders/${orderId}`}>
                <Button>Return to Order</Button>
              </Link>
            ) : null}
            <Link to="/orders">
              <Button variant="secondary">All Orders</Button>
            </Link>
            <Link to="/checkout">
              <Button variant="ghost">Back to Checkout</Button>
            </Link>
          </div>
        </section>
      </PageWrapper>
    </main>
  );
};
