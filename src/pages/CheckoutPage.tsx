import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageWrapper } from '../components/layout/PageWrapper';
import { usePayments } from '../hooks/usePayments';
import { useCreateOrder } from '../hooks/useOrders';
import { useCart } from '../hooks/useCart';
import type { PaymentMethod } from '../types/order.types';
import { formatPrice } from '../utils/format.utils';

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
  const { mutateAsync: createOrder, isPending } = useCreateOrder();
  const { totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
  });

  const handleShippingSubmit = () => setStep(2);

  const placeOrder = async () => {
    await createOrder({
      shippingAddress: getValues(),
      paymentMethod,
    });
    await clearCart();
    navigate('/orders');
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
                <label key={method.value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{method.label}</p>
                    <p className="text-sm font-medium text-gray-600">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>
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
            <p className="text-sm font-medium text-gray-600">
              Payment: <span className="font-semibold text-gray-900">{paymentMethod}</span>
            </p>
            <p className="text-xl font-bold text-indigo-600">Total: {formatPrice(totalPrice)}</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button isLoading={isPending} onClick={() => void placeOrder()}>
                Place Order
              </Button>
            </div>
          </section>
        ) : null}
      </section>
    </PageWrapper>
  );
};
