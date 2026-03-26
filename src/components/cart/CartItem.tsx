import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '../../types/cart.types';
import { formatPrice } from '../../utils/format.utils';

interface CartItemProps {
  item: CartItemType;
  onUpdate: (itemId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
}

export const CartItem = ({ item, onUpdate, onRemove }: CartItemProps) => {
  return (
    <article className="flex gap-3 rounded-2xl bg-white p-4 shadow-md">
      <img
        src={item.product.imageUrl}
        alt={item.product.name}
        className="h-24 w-24 rounded-xl object-cover"
      />

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">{item.product.name}</h3>
          <p className="text-sm font-medium text-gray-600">
            {formatPrice(item.product.price)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-1">
            <button
              onClick={() => void onUpdate(item.id, Math.max(1, item.quantity - 1))}
              className="rounded-lg p-1 hover:bg-gray-100"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              onClick={() => void onUpdate(item.id, item.quantity + 1)}
              className="rounded-lg p-1 hover:bg-gray-100"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={() => void onRemove(item.id)}
            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
            aria-label="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
};
