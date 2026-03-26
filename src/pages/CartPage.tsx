import { useNavigate } from 'react-router-dom';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { EmptyState } from '../components/ui/EmptyState';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useCart } from '../hooks/useCart';

export const CartPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, updateItem, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <PageWrapper>
        <div className="py-10">
          <EmptyState
            title="Your cart is empty"
            description="Looks like you have not added any products yet."
            actionLabel="Back to Home"
            actionTo="/home"
          />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <section className="grid gap-6 py-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          ))}
        </div>

        <CartSummary subtotal={totalPrice} onCheckout={() => navigate('/checkout')} />
      </section>
    </PageWrapper>
  );
};
