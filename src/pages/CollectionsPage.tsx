import { useMemo, useState } from 'react';
import { Layers } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProductGrid } from '../components/products/ProductGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import type { Product } from '../types/product.types';

export const CollectionsPage = () => {
  const [search, setSearch] = useState('');
  const { addItem } = useCart();

  const params = useMemo(
    () => ({ page: 1, limit: 50, search: search || undefined }),
    [search],
  );

  const { data, isLoading } = useProducts(params);

  // Group products by category client-side
  const grouped = useMemo(() => {
    const products = data?.data ?? [];
    const map: Record<string, { categoryName: string; items: Product[] }> = {};
    for (const p of products) {
      if (!map[p.categoryId]) {
        map[p.categoryId] = { categoryName: p.categoryName, items: [] };
      }
      map[p.categoryId].items.push(p);
    }
    return Object.values(map);
  }, [data]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar search={search} onSearchChange={setSearch} />
      <PageWrapper>
        <div className="space-y-6 py-6">
          {/* Hero banner */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
            <div className="mb-2 flex items-center gap-3">
              <Layers size={24} />
              <h1 className="text-2xl font-black">Top Collections</h1>
            </div>
            <p className="text-sm text-emerald-100">
              Browse our curated selection organized by category
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-6 w-40 animate-pulse rounded-lg bg-gray-200" />
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-64 animate-pulse rounded-2xl bg-white shadow-sm" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <EmptyState title="No collections found" description="No products are available yet." />
          ) : (
            grouped.map((group) => (
              <section key={group.categoryName} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">{group.categoryName}</h2>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600">
                    {group.items.length} items
                  </span>
                </div>
                <ProductGrid
                  products={group.items}
                  isLoading={false}
                  onAddToCart={(id) => addItem(id, 1)}
                />
              </section>
            ))
          )}
        </div>
      </PageWrapper>
    </main>
  );
};
