import { Button } from '../ui/Button';
import { TAX_RATE } from '../../utils/constants';
import { formatPrice } from '../../utils/format.utils';

interface CartSummaryProps {
  subtotal: number;
  onCheckout: () => void;
}

export const CartSummary = ({ subtotal, onCheckout }: CartSummaryProps) => {
  const estimatedTax = subtotal * TAX_RATE;
  const total = subtotal + estimatedTax;

  return (
    <aside className="space-y-4 rounded-2xl bg-white p-5 shadow-md">
      <h3 className="text-lg font-bold tracking-tight text-gray-900">Order Summary</h3>
      <div className="space-y-2 text-sm font-medium text-gray-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated tax</span>
          <span>{formatPrice(estimatedTax)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
      <Button className="w-full" onClick={onCheckout}>
        Proceed to Checkout
      </Button>
    </aside>
  );
};
