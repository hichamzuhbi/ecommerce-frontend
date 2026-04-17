import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { paymentsApi } from '../api/payments.api';

type PaymentFlowStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

const toHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
};

const signStripePayload = async (rawBody: string, timestamp: number): Promise<string> => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode('mock-payment-secret');
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const message = `${timestamp}.${rawBody}`;
  const signature = await window.crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return toHex(signature);
};

const resolveOrderId = (searchParams: URLSearchParams): string => {
  return (
    searchParams.get('orderId') ||
    localStorage.getItem('pendingOrderId') ||
    ''
  );
};

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const paymentId = searchParams.get('paymentId');
  const methodParam = searchParams.get('method');
  const orderId = useMemo(() => resolveOrderId(searchParams), [searchParams]);
  const isCod = methodParam === 'COD' || searchParams.get('cod') === '1';
  const isMock = searchParams.get('mock') === 'true';
  const [status, setStatus] = useState<PaymentFlowStatus>('PENDING');
  const [isPolling, setIsPolling] = useState(!isCod && !isMock);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const hasFinalized = useRef(false);

  useEffect(() => {
    if (!orderId || isCod || isMock) {
      if (isCod) {
        setStatus('SUCCESS');
        setIsPolling(false);
      }
      if (isMock) {
        setIsPolling(false);
      }
      return;
    }

    let isMounted = true;
    let intervalId: number | null = null;

    const pollStatus = async () => {
      try {
        const data = await paymentsApi.status(orderId);
        const paymentStatus = (data.paymentStatus ?? '').toString().toUpperCase();
        const providerStatus = (data.status ?? '').toString().toUpperCase();

        let nextStatus: PaymentFlowStatus = 'PENDING';
        if (providerStatus === 'SUCCESS' || providerStatus === 'FAILED') {
          nextStatus = providerStatus as PaymentFlowStatus;
        } else if (paymentStatus === 'PAID') {
          nextStatus = 'SUCCESS';
        } else if (paymentStatus === 'UNPAID') {
          nextStatus = 'PENDING';
        }

        if (!isMounted) return;
        setStatus(nextStatus);

        if (nextStatus === 'SUCCESS' || nextStatus === 'FAILED') {
          if (intervalId) {
            window.clearInterval(intervalId);
          }
          setIsPolling(false);
          if (!hasFinalized.current) {
            hasFinalized.current = true;
            await queryClient.invalidateQueries({ queryKey: ['order', orderId] });
            await queryClient.invalidateQueries({ queryKey: ['orders'] });
            if (nextStatus === 'SUCCESS') {
              toast.success('Payment confirmed.');
            } else {
              toast.error('Payment failed. Please try again.');
            }
          }
        }
      } catch {
        if (!isMounted) return;
        setIsPolling(false);
        setStatus('FAILED');
        setErrorMessage('We could not confirm the payment status.');
      }
    };

    setIsPolling(true);
    void pollStatus();
    intervalId = window.setInterval(() => void pollStatus(), 3000);

    return () => {
      isMounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isCod, isMock, orderId, queryClient]);

  if (!orderId) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar search="" onSearchChange={() => undefined} />
        <PageWrapper>
          <section className="mx-auto max-w-3xl py-10">
            <EmptyState
              title="Missing payment reference"
              description="We could not find the order to confirm. Please visit your orders to retry."
              actionLabel="Go to Orders"
              actionTo="/orders"
            />
          </section>
        </PageWrapper>
      </main>
    );
  }

  const statusBadge = status === 'SUCCESS' ? 'success' : status === 'FAILED' ? 'danger' : 'warning';

  const handleSimulateSuccess = async () => {
    if (!paymentId) {
      setErrorMessage('Missing payment reference for mock confirmation.');
      return;
    }
    try {
      setIsSimulating(true);
      const timestamp = Math.floor(Date.now() / 1000);
      const rawBody = JSON.stringify({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: `mock_pi_${paymentId}`,
            status: 'succeeded',
            metadata: {
              paymentId,
            },
          },
        },
      });
      const signature = await signStripePayload(rawBody, timestamp);
      const signatureHeader = `t=${timestamp},v1=${signature}`;
      await paymentsApi.mockWebhook(rawBody, signatureHeader);
      setStatus('SUCCESS');
      await queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.invalidateQueries({ queryKey: ['payment', orderId] });
      toast.success('Mock payment confirmed.');
    } catch {
      setErrorMessage('Could not simulate payment success.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar search="" onSearchChange={() => undefined} />
      <PageWrapper>
        <section className="mx-auto max-w-3xl space-y-6 py-10">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Payment Status</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              {isCod ? 'Order placed' : isMock ? 'Payment simulation' : 'Payment processing'}
            </h1>
            <p className="mt-1 text-sm font-medium text-gray-600">
              {isCod
                ? 'Order placed! Pay on delivery.'
                : isMock
                  ? 'Stripe is in mock mode. Simulate a success webhook to continue.'
                  : 'We are confirming your payment with the provider.'}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">Order Reference</p>
                <p className="text-lg font-bold text-gray-900">{orderId}</p>
                {paymentId ? (
                  <p className="mt-1 text-xs font-medium text-gray-500">Payment ID: {paymentId}</p>
                ) : null}
              </div>
              <Badge variant={statusBadge}>{status}</Badge>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                {isPolling ? <Spinner /> : null}
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    {status === 'SUCCESS'
                      ? 'Payment successful'
                      : status === 'FAILED'
                        ? 'Payment failed'
                        : isMock
                          ? 'Awaiting mock confirmation'
                          : 'Checking payment status'}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    {status === 'SUCCESS'
                      ? 'Your order is confirmed and ready for processing.'
                      : status === 'FAILED'
                        ? 'Please retry the payment from your order page.'
                        : isMock
                          ? 'Use the button below to simulate a success webhook.'
                          : 'This usually takes a few seconds. Stay on this page.'}
                  </p>
                  {errorMessage ? (
                    <p className="mt-2 text-sm font-semibold text-red-500">{errorMessage}</p>
                  ) : null}
                </div>
              </div>
            </div>

            {isMock ? (
              <div className="mt-4">
                <Button isLoading={isSimulating} onClick={() => void handleSimulateSuccess()}>
                  Simulate Payment Success
                </Button>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/orders/${orderId}`}>
                <Button>View Order</Button>
              </Link>
              <Link to="/orders">
                <Button variant="secondary">All Orders</Button>
              </Link>
            </div>
          </div>
        </section>
      </PageWrapper>
    </main>
  );
};
