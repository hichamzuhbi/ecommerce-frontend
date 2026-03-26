import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Headphones,
  LifeBuoy,
  Megaphone,
  Truck,
  X,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProductGrid } from '../components/products/ProductGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { PRODUCTS_PAGE_LIMIT } from '../utils/constants';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';

const MARQUEE_ITEMS = [
  '🔥 Flash Sale',
  'Free Shipping over $80',
  '⭐ New Arrivals',
  '🎁 Weekly Deals',
  '🚀 Limited Time Offers',
  '💎 Premium Brands',
  '🛍️ Exclusive Discounts',
];

const FAQ_ITEMS = [
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery takes 3–5 business days. Express delivery is available within 1–2 business days.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a 30-day hassle-free return policy. Items must be in original condition with the receipt.',
  },
  {
    q: 'How do I track my order?',
    a: "Once your order ships, you'll receive a tracking number via email. Check the Orders page for real-time updates.",
  },
  {
    q: 'Do you ship internationally?',
    a: 'Yes! We ship to 50+ countries. International shipping rates vary by destination.',
  },
  {
    q: 'How can I contact customer support?',
    a: 'Reach us at support@easyshop.com or via the Live Support panel — available 24/7.',
  },
];

type ModalKind = 'shipping' | 'support' | 'help' | null;

/* ── Modal header helper ────────────────────────────── */
interface ModalHeaderProps {
  icon: ReactNode;
  title: string;
  badge?: ReactNode;
  onClose: () => void;
}
const ModalHeader = ({ icon, title, badge, onClose }: ModalHeaderProps) => (
  <div className="mb-5 flex items-center justify-between">
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      {badge}
    </div>
    <button
      onClick={onClose}
      className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      aria-label="Close"
    >
      <X size={18} />
    </button>
  </div>
);

/* ── Page ───────────────────────────────────────────── */
export const HomePage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [openModal, setOpenModal] = useState<ModalKind>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [supportMsg, setSupportMsg] = useState('');
  const navigate = useNavigate();
  const { addItem } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const productParams = useMemo(
    () => ({
      page: 1,
      limit: PRODUCTS_PAGE_LIMIT,
      search: debouncedSearch || undefined,
      categoryId: undefined,
    }),
    [debouncedSearch],
  );

  const { data, isLoading } = useProducts(productParams);
  const products = data?.data ?? [];

  const closeModal = () => {
    setOpenModal(null);
    setOpenFaq(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar search={searchInput} onSearchChange={setSearchInput} />

      <PageWrapper>
        <section className="grid grid-cols-1 gap-4 py-6 lg:grid-cols-[minmax(0,1fr)_280px]">

          {/* ── CENTER CONTENT ── */}
          <div className="space-y-4">
            {/* Marquee promo banner */}
            <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-2.5">
              <div className="animate-marquee whitespace-nowrap">
                {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((text, i) => (
                  <span key={i} className="mx-10 text-sm font-bold text-white">
                    {text}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h1 className="text-xl font-bold tracking-tight text-gray-900">Products Grid</h1>
              <p className="text-sm font-medium text-gray-500">
                Discover our curated product selection.
              </p>
            </div>

            {products.length === 0 && !isLoading ? (
              <EmptyState
                title="No products found"
                description="Try changing your search input from the app bar."
              />
            ) : (
              <ProductGrid
                products={products}
                isLoading={isLoading}
                onAddToCart={(productId) => addItem(productId, 1)}
              />
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="hidden h-fit space-y-3 rounded-2xl bg-white p-4 shadow-sm lg:block">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Quick Panels</p>

            {/* Shipping Offer */}
            <button
              onClick={() => setOpenModal('shipping')}
              className="group w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-left transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50"
            >
              <div className="mb-1 flex items-center gap-2">
                <Truck size={15} className="text-indigo-500 transition-colors group-hover:text-indigo-700" />
                <p className="text-sm font-bold text-gray-900">Shipping Offer</p>
              </div>
              <p className="text-xs font-medium text-gray-500">Free shipping on orders above $80</p>
            </button>

            {/* Live Support */}
            <button
              onClick={() => setOpenModal('support')}
              className="group w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-left transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <Headphones size={15} className="text-emerald-600 transition-colors group-hover:text-emerald-700" />
                <p className="text-sm font-bold text-gray-900">Live Support</p>
              </div>
              <p className="text-xs font-medium text-gray-500">Support available 24/7 for all customers</p>
            </button>

            {/* Weekly Deals — navigate to /deals */}
            <button
              onClick={() => navigate('/deals')}
              className="group w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-left transition-all duration-200 hover:border-orange-200 hover:bg-orange-50"
            >
              <div className="mb-1 flex items-center gap-2">
                <Megaphone size={15} className="text-orange-500 transition-colors group-hover:text-orange-600" />
                <p className="text-sm font-bold text-gray-900">Weekly Deals</p>
              </div>
              <p className="text-xs font-medium text-gray-500">Flash discounts updated every Friday</p>
            </button>

            {/* Help Center */}
            <button
              onClick={() => setOpenModal('help')}
              className="group w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-left transition-all duration-200 hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="mb-1 flex items-center gap-2">
                <LifeBuoy size={15} className="text-blue-500 transition-colors group-hover:text-blue-700" />
                <p className="text-sm font-bold text-gray-900">Help Center</p>
              </div>
              <p className="text-xs font-medium text-gray-500">Find quick answers in one place</p>
            </button>
          </aside>
        </section>
      </PageWrapper>

      {/* ── ANIMATED MODALS ── */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4"
            onClick={closeModal}
          >
            <motion.div
              key="card"
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 24 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >

              {/* ── Shipping Modal ── */}
              {openModal === 'shipping' && (
                <>
                  <ModalHeader
                    icon={<Truck size={18} className="text-indigo-600" />}
                    title="Shipping Offer"
                    onClose={closeModal}
                  />
                  <div className="space-y-4 text-sm">
                    <div className="rounded-xl bg-indigo-50 p-4">
                      <p className="font-bold text-indigo-700">🎉 Free Shipping on orders over $80!</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 text-xs font-bold uppercase text-gray-400">Type</th>
                          <th className="pb-2 text-xs font-bold uppercase text-gray-400">Time</th>
                          <th className="pb-2 text-xs font-bold uppercase text-gray-400">Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        <tr>
                          <td className="py-2.5 font-semibold text-gray-800">Standard</td>
                          <td className="py-2.5 text-gray-500">3–5 days</td>
                          <td className="py-2.5 text-gray-500">$4.99</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-gray-800">Express</td>
                          <td className="py-2.5 text-gray-500">1–2 days</td>
                          <td className="py-2.5 text-gray-500">$12.99</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-gray-800">Free</td>
                          <td className="py-2.5 text-gray-500">3–5 days</td>
                          <td className="py-2.5 font-bold text-emerald-600">Orders ≥ $80</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-xs text-gray-400">
                      * Available in: USA, Canada, UK, EU, Australia
                    </p>
                  </div>
                </>
              )}

              {/* ── Live Support Modal ── */}
              {openModal === 'support' && (
                <>
                  <ModalHeader
                    icon={<Headphones size={18} className="text-emerald-600" />}
                    title="Live Support"
                    badge={
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        Online
                      </span>
                    }
                    onClose={closeModal}
                  />
                  <div className="space-y-4">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs space-y-2">
                      <p>
                        <span className="font-bold text-gray-700">Email: </span>
                        <span className="text-gray-500">support@easyshop.com</span>
                      </p>
                      <p>
                        <span className="font-bold text-gray-700">Hours: </span>
                        <span className="text-gray-500">24/7, 365 days a year</span>
                      </p>
                      <p>
                        <span className="font-bold text-gray-700">Response time: </span>
                        <span className="text-gray-500">Under 2 hours</span>
                      </p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-gray-700">
                        Send us a message
                      </label>
                      <textarea
                        value={supportMsg}
                        onChange={(e) => setSupportMsg(e.target.value)}
                        rows={3}
                        placeholder="Describe your issue or question..."
                        className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setSupportMsg('');
                        closeModal();
                      }}
                      className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
                    >
                      Send Message
                    </button>
                  </div>
                </>
              )}

              {/* ── Help Center / FAQ Modal ── */}
              {openModal === 'help' && (
                <>
                  <ModalHeader
                    icon={<LifeBuoy size={18} className="text-blue-600" />}
                    title="Help Center — FAQ"
                    onClose={closeModal}
                  />
                  <div className="space-y-2">
                    {FAQ_ITEMS.map((item, idx) => (
                      <div key={idx} className="overflow-hidden rounded-xl border border-gray-100">
                        <button
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                          onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        >
                          <span>{item.q}</span>
                          <motion.span
                            animate={{ rotate: openFaq === idx ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown size={16} className="shrink-0 text-gray-400" />
                          </motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {openFaq === idx && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22 }}
                              className="overflow-hidden"
                            >
                              <p className="px-4 pb-3 text-xs font-medium leading-relaxed text-gray-500">
                                {item.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};
