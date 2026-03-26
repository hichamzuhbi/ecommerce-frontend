import { useMemo, useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { EmptyState } from '../components/ui/EmptyState';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/format.utils';

export const WishlistPage = () => {
  const [search, setSearch] = useState('');
  const { wishlist, toggle } = useWishlist();
  const { addItem } = useCart();

  // Fetch all products, then filter client-side to wishlist IDs
  const params = useMemo(() => ({ page: 1, limit: 100 }), []);
  const { data, isLoading } = useProducts(params);

  const wishlisted = useMemo(() => {
    const all = data?.data ?? [];
    return all.filter((p) => wishlist.includes(p.id));
  }, [data, wishlist]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar search={search} onSearchChange={setSearch} />
      <PageWrapper>
        <div className="space-y-4 py-6">
          {/* Hero banner */}
          <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
            <div className="mb-2 flex items-center gap-3">
              <Heart size={24} className="fill-white" />
              <h1 className="text-2xl font-black">My Wishlist</h1>
            </div>
            <p className="text-sm text-pink-100">
              {wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : wishlisted.length === 0 ? (
            <EmptyState
              title="Your wishlist is empty"
              description="Click the heart icon on any product to save it here."
            />
          ) : (
            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
            >
              {wishlisted.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                  }}
                >
                  <div className="overflow-hidden rounded-2xl bg-white shadow-md">
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <Link to={`/products/${product.id}`} className="block h-full w-full">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                        />
                      </Link>
                      <button
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm"
                        onClick={() => toggle(product.id)}
                        aria-label="Remove from wishlist"
                      >
                        <Heart size={15} className="fill-red-500 text-red-500" />
                      </button>
                    </div>
                    <div className="space-y-2 p-4">
                      <h3 className="line-clamp-1 text-sm font-bold text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-base font-bold text-indigo-600">
                        {formatPrice(product.price)}
                      </p>
                      <button
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                        onClick={() => void addItem(product.id, 1)}
                      >
                        <ShoppingCart size={14} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </PageWrapper>
    </main>
  );
};
