import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProductGrid } from '../components/products/ProductGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';

export const TrendingPage = () => {
  const [search, setSearch] = useState('');
  const { addItem } = useCart();

  const params = useMemo(
    () => ({ page: 1, limit: 20, search: search || undefined }),
    [search],
  );

  const { data, isLoading } = useProducts(params);
  const products = data?.data ?? [];

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar search={search} onSearchChange={setSearch} />
      <PageWrapper>
        <div className="space-y-4 py-6">
          {/* Hero banner */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-950 to-sky-600 p-6 text-white">
            <div className="mb-2 flex items-center gap-3">
              <Sparkles size={24} />
              <h1 className="text-2xl font-black">Trending Picks</h1>
            </div>
            <p className="text-sm text-sky-100">
              The hottest products everyone is buying right now
            </p>
          </div>

          {products.length === 0 && !isLoading ? (
            <EmptyState
              title="No trending products"
              description="Check back soon for the latest trending picks!"
            />
          ) : (
            <ProductGrid
              products={products}
              isLoading={isLoading}
              onAddToCart={(id) => addItem(id, 1)}
            />
          )}
        </div>
      </PageWrapper>
    </main>
  );
};
