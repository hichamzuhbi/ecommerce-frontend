import { useMemo, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProductGrid } from '../components/products/ProductGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';

export const DealsPage = () => {
  const [search, setSearch] = useState('');
  const { addItem } = useCart();

  const params = useMemo(
    () => ({ page: 1, limit: 50, search: search || undefined }),
    [search],
  );

  const { data, isLoading } = useProducts(params);

  // Filter products that have a comparePrice (i.e. are on sale),
  // then sort by biggest absolute saving descending
  const dealProducts = useMemo(() => {
    const all = data?.data ?? [];
    return all
      .filter((p) => p.comparePrice && p.comparePrice > p.price)
      .sort((a, b) => {
        const savingA = (a.comparePrice ?? 0) - a.price;
        const savingB = (b.comparePrice ?? 0) - b.price;
        return savingB - savingA;
      });
  }, [data]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar search={search} onSearchChange={setSearch} />
      <PageWrapper>
        <div className="space-y-4 py-6">
          {/* Hero banner */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-950 to-emerald-600 p-6 text-white">
            <div className="mb-2 flex items-center gap-3">
              <Megaphone size={24} />
              <h1 className="text-2xl font-black">Weekly Deals</h1>
            </div>
            <p className="text-sm text-orange-100">
              Flash discounts — updated every Friday. Don't miss out!
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : dealProducts.length === 0 ? (
            <EmptyState
              title="No deals right now"
              description="Check back on Friday for fresh weekly deals!"
            />
          ) : (
            <ProductGrid
              products={dealProducts}
              isLoading={false}
              onAddToCart={(id) => addItem(id, 1)}
            />
          )}
        </div>
      </PageWrapper>
    </main>
  );
};
