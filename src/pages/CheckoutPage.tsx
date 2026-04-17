import { useMemo, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageWrapper } from '../components/layout/PageWrapper';
import toast from 'react-hot-toast';
import { useInitiatePayment, usePayments } from '../hooks/usePayments';
import { useCreateOrder } from '../hooks/useOrders';
import { useCart } from '../hooks/useCart';
import type { PaymentMethod } from '../types/order.types';
import { formatPrice } from '../utils/format.utils';

const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value);

const shippingSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  country: z.string().min(2),
  zipCode: z.string().min(3),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { data: methods = [] } = usePayments();
  const { mutateAsync: initiatePayment, isPending: isPaymentPending } = useInitiatePayment();
  const { mutateAsync: createOrder, isPending } = useCreateOrder();
  const { totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [cardholderName, setCardholderName] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
  });

  const paymentSummary = useMemo(() => {
    if (paymentMethod === 'PAYPAL') {
      return {
        title: 'Pay with PayPal',
        description: 'You will be redirected to PayPal checkout powered by Stripe.',
        ctaLabel: 'Pay with PayPal',
      };
    }
    if (paymentMethod === 'COD') {
      return {
        title: 'Cash on Delivery',
        description: 'Place your order now and pay the courier on delivery.',
        ctaLabel: 'Place Order',
      };
    }
    return {
      title: 'Pay by Credit Card',
      description: 'You will be redirected to a secure card payment page.',
      ctaLabel: 'Pay Now',
    };
  }, [paymentMethod]);

  const handleShippingSubmit = () => setStep(2);

  const placeOrder = async () => {
    try {
      const createdOrder = await createOrder({
        shippingAddress: getValues(),
        paymentMethod,
      });

      localStorage.setItem('pendingOrderId', createdOrder.id);

      const response = await initiatePayment({
        orderId: createdOrder.id,
        method: paymentMethod,
      });

      await clearCart();

      if (response.paymentUrl && isAbsoluteUrl(response.paymentUrl)) {
        window.location.href = response.paymentUrl;
        return;
      }

      if (paymentMethod !== 'COD') {
        const paymentId = response.paymentId ?? '';
        navigate(
          `/payment/success?paymentId=${encodeURIComponent(paymentId)}&orderId=${createdOrder.id}&mock=true`,
        );
        return;
      }

      if (paymentMethod === 'COD') {
        navigate(`/payment/success?method=COD&orderId=${createdOrder.id}`);
        return;
      }

      toast.error('Payment could not be started. You can retry from your order page.');
      navigate(`/orders/${createdOrder.id}`);
    } catch {
      toast.error('Could not place the order. Please try again.');
    }
  };

  return (
    <PageWrapper>
      <section className="mx-auto max-w-3xl space-y-6 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Checkout</h1>

        {step === 1 ? (
          <form onSubmit={handleSubmit(handleShippingSubmit)} className="space-y-4 rounded-2xl bg-white p-6 shadow-md">
            <h2 className="text-lg font-bold text-gray-900">Step 1: Shipping Address</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
              <Input label="Address" error={errors.address?.message} {...register('address')} />
              <Input label="City" error={errors.city?.message} {...register('city')} />
              <Input label="Country" error={errors.country?.message} {...register('country')} />
              <Input label="Zip Code" error={errors.zipCode?.message} {...register('zipCode')} />
            </div>
            <Button type="submit">Continue</Button>
          </form>
        ) : null}

        {step === 2 ? (
          <section className="space-y-4 rounded-2xl bg-white p-6 shadow-md">
            <h2 className="text-lg font-bold text-gray-900">Step 2: Payment Method</h2>
            <div className="space-y-2">
              {methods.map((method) => (
                <label
                  key={method.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all duration-200 ${
                    paymentMethod === method.value
                      ? 'border-sky-200 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(event) => setPaymentMethod(event.currentTarget.value as PaymentMethod)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{method.label}</p>
                    <p className="text-sm font-medium text-gray-600">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {paymentMethod === 'CREDIT_CARD' ? (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Card Details</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    name="cardNumber"
                    autoComplete="cc-number"
                  />
                  <Input
                    label="Expiry Date"
                    placeholder="MM/YY"
                    name="expiryDate"
                    autoComplete="cc-exp"
                  />
                  <Input
                    label="CVV"
                    placeholder="123"
                    name="cvv"
                    autoComplete="cc-csc"
                  />
                  <Input
                    label="Cardholder Name"
                    placeholder="Jane Doe"
                    name="cardholderName"
                    autoComplete="cc-name"
                    value={cardholderName}
                    onChange={(event) => setCardholderName(event.target.value)}
                  />
                </div>
                <p className="mt-3 text-xs font-medium text-gray-500">
                  Card details are captured for display only. You will complete payment securely on the next page.
                </p>
              </div>
            ) : null}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>Continue</Button>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="space-y-4 rounded-2xl bg-white p-6 shadow-md">
            <h2 className="text-lg font-bold text-gray-900">Step 3: Order Summary</h2>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-700">{paymentSummary.title}</p>
              <p className="mt-1 text-sm font-medium text-gray-600">{paymentSummary.description}</p>
            </div>
            <p className="text-xl font-bold text-indigo-600">Total: {formatPrice(totalPrice)}</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button isLoading={isPending || isPaymentPending} onClick={() => void placeOrder()}>
                {paymentSummary.ctaLabel}
              </Button>
            </div>
          </section>
        ) : null}
      </section>
    </PageWrapper>
  );
};
