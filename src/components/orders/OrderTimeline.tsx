import type { OrderStatus } from '../../types/order.types';

const steps: OrderStatus[] = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

interface OrderTimelineProps {
  status: OrderStatus;
}

export const OrderTimeline = ({ status }: OrderTimelineProps) => {
  const activeIndex = Math.max(steps.indexOf(status), 0);

  return (
    <div className="space-y-3 rounded-2xl bg-white p-5 shadow-md">
      <h3 className="text-lg font-bold tracking-tight text-gray-900">Order Progress</h3>
      <ol className="space-y-2">
        {steps.map((step, index) => {
          const isActive = index <= activeIndex;
          return (
            <li key={step} className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isActive ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
              <span
                className={`text-sm font-semibold ${
                  isActive ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
