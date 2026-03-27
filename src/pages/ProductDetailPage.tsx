import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductById, useRelatedProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/format.utils';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProductGrid } from '../components/products/ProductGrid';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Spinner } from '../components/ui/Spinner';
import { handleImageError, IMAGE_FALLBACK_URL, resolveImageUrl } from '../utils/image.utils';

export const ProductDetailPage = () => {
  const { id = '' } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const { data: product, isLoading } = useProductById(id);
  const categoryId = useMemo(() => product?.categoryId ?? '', [product?.categoryId]);
  const { data: relatedProducts = [] } = useRelatedProducts(categoryId);

  if (isLoading || !product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <PageWrapper>
      <section className="grid gap-8 py-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-white shadow-md">
          <img
            src={resolveImageUrl(product.imageUrl) || IMAGE_FALLBACK_URL}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={handleImageError}
          />
        </div>

        <div className="space-y-4">
          <Badge>{product.categoryName}</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
          <p className="text-xl font-bold text-indigo-600">{formatPrice(product.price)}</p>
          <p className="font-medium text-gray-600">{product.description}</p>
          <p className="text-sm font-semibold text-gray-700">
            Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
          </p>

          <div className="flex items-center gap-3">
            <label htmlFor="quantity" className="text-sm font-semibold text-gray-700">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="w-20 rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
            <Button onClick={() => void addItem(product.id, quantity)}>Add to Cart</Button>
          </div>
        </div>
      </section>

      <section className="pb-10">
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-900">Related Products</h2>
        <ProductGrid
          products={relatedProducts.filter((item) => item.id !== product.id)}
          isLoading={false}
          onAddToCart={(productId) => addItem(productId, 1)}
        />
      </section>
    </PageWrapper>
  );
};
