import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { Product } from '../../types/product.types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onAddToCart: (productId: string) => Promise<void>;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const ProductGrid = ({
  products,
  isLoading,
  onAddToCart,
}: ProductGridProps) => {
  const gridClass =
    'grid w-full grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3';

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-2xl bg-white shadow-md"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={gridClass}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </motion.div>
      ))}
    </motion.div>
  );
};
