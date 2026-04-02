import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { formatPrice } from '../../utils/format.utils';
import { handleImageError, IMAGE_FALLBACK_URL, resolveImageUrl } from '../../utils/image.utils';
import { useWishlist } from '../../context/WishlistContext';
import type { Product } from '../../types/product.types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => Promise<void>;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  return (
    <motion.article
      className="overflow-hidden rounded-2xl bg-white shadow-md"
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(79,70,229,0.15)' }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      {/* Image with zoom + wishlist overlay */}
      <div className="relative block aspect-square overflow-hidden bg-gray-100">
        <Link to={`/products/${product.id}`} className="block h-full w-full">
          <motion.img
            src={resolveImageUrl(product.imageUrl) || IMAGE_FALLBACK_URL}
            alt={product.name}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            loading="lazy"
            onError={handleImageError}
          />
        </Link>

        {/* Wishlist heart button */}
        <motion.button
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm"
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => toggle(product.id)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={15}
            className={wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}
          />
        </motion.button>

        {/* Discount badge */}
        {product.comparePrice ? (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-black text-white">
            -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
          </span>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <Badge>{product.categoryName}</Badge>
        <h3 className="line-clamp-1 text-base font-bold tracking-tight text-gray-900">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-indigo-600">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice ? (
            <span className="text-sm font-medium text-gray-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          ) : null}
        </div>

        <motion.button
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          whileTap={{ scale: 0.93 }}
          onClick={() => void onAddToCart(product.id)}
        >
          <ShoppingCart size={15} />
          Add to Cart
        </motion.button>
      </div>
    </motion.article>
  );
};

