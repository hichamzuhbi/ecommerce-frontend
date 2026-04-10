import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Badge } from '../components/ui/Badge';
import { Navbar } from '../components/layout/Navbar';
import { OrderTimeline } from '../components/orders/OrderTimeline';
import { Spinner } from '../components/ui/Spinner';
import { useOrderDetail } from '../hooks/useOrders';
import { useInitiatePayment } from '../hooks/usePayments';
import { formatOrderRef, formatPrice } from '../utils/format.utils';
import { PageWrapper } from '../components/layout/PageWrapper';
import { handleImageError, IMAGE_FALLBACK_URL, resolveImageUrl } from '../utils/image.utils';
import { paymentsApi } from '../api/payments.api';
import { Button } from '../components/ui/Button';

const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value);

export const OrderDetailPage = () => {
  const [search, setSearch] = useState('');
  const { id = '' } = useParams();
  const { data: order, isLoading } = useOrderDetail(id);
  const queryClient = useQueryClient();
  const { mutateAsync: initiatePayment, isPending: isInitiating } = useInitiatePayment();
  const { mutateAsync: refreshPaymentStatus, isPending: isRefreshing } = useMutation({
    mutationFn: () => paymentsApi.status(id),
    onSuccess: async (data) => {
      const status = data.paymentStatus ?? data.status;
      if (status) {
        toast.success(`Payment status: ${status}`);
      } else {
        toast.success('Payment status updated');
      }
      await queryClient.invalidateQueries({ queryKey: ['order', id] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => toast.error('Could not refresh payment status'),
  });

  if (isLoading || !order) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar search={search} onSearchChange={setSearch} />
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner />
        </div>
      </main>
    );
  }

  const canPayNow = order.paymentStatus === 'UNPAID' && order.paymentMethod !== 'COD';

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar search={search} onSearchChange={setSearch} />
      <PageWrapper>
        <section className="space-y-6 py-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Order Details</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">{formatOrderRef(order.id)}</h1>
            <p className="mt-1 text-xs font-medium tracking-wide text-gray-400">Ref: {order.id}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <div className="rounded-2xl bg-white p-5 shadow-md">
                <div className="flex items-center gap-3">
                  <Badge>{order.status}</Badge>
                  <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl bg-white p-5 shadow-md">
                <h2 className="text-lg font-bold text-gray-900">Items</h2>
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <img
                      src={resolveImageUrl(item.product.imageUrl) || IMAGE_FALLBACK_URL}
                      alt={item.product.name}
                      className="h-16 w-16 rounded-lg object-cover"
                      onError={handleImageError}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.product.name}</p>
                      <p className="text-sm font-medium text-gray-600">
                        {item.quantity} x {formatPrice(item.product.price)}
                      </p>
                    </div>
                  </div>
                ))}
                <p className="text-right text-lg font-bold text-indigo-600">Total: {formatPrice(order.totalAmount ?? order.total ?? 0)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <OrderTimeline status={order.status} />
              <div className="rounded-2xl bg-white p-5 shadow-md">
                <h3 className="text-lg font-bold text-gray-900">Payment</h3>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                    {order.paymentStatus}
                  </Badge>
                  <span className="text-sm font-semibold text-gray-700">
                    Method: {order.paymentMethod}
                  </span>
                </div>
                {order.paymentMethod === 'COD' ? (
                  <p className="mt-3 text-sm font-medium text-gray-600">
                    Cash on delivery - payment is collected when the order arrives.
                  </p>
                ) : (
                  <p className="mt-3 text-sm font-medium text-gray-600">
                    Use Pay Now to complete your payment securely.
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {canPayNow ? (
                    <Button isLoading={isInitiating} onClick={async () => {
                      const response = await initiatePayment({
                        orderId: order.id,
                        method: order.paymentMethod,
                      });
                      if (response.paymentUrl && isAbsoluteUrl(response.paymentUrl)) {
                        window.location.href = response.paymentUrl;
                        return;
                      }
                      toast.success('Payment initiated. Complete the payment with your provider.');
                    }}>
                      Pay Now
                    </Button>
                  ) : null}
                  <Button
                    variant="secondary"
                    isLoading={isRefreshing}
                    onClick={() => void refreshPaymentStatus()}
                  >
                    Refresh Status
                  </Button>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-md">
                <h3 className="text-lg font-bold text-gray-900">Shipping Address</h3>
                <p className="mt-2 text-sm font-medium text-gray-600">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="text-sm font-medium text-gray-600">{order.shippingAddress.address}</p>
                <p className="text-sm font-medium text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.country} {order.shippingAddress.zipCode}
                </p>
                </div>
              </div>
            </div>
          </section>
        </PageWrapper>
      </main>
    );
};
