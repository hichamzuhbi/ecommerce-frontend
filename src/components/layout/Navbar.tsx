import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { hasAdminAccess } from '../../utils/auth.utils';

interface NavbarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const NAV_ITEMS = [
  { label: 'Home', to: '/home' },
  { label: 'Shop', to: '/trending' },
  { label: 'Categories', to: '/collections' },
  { label: 'Deals', to: '/deals' },
  { label: 'Contact', href: 'mailto:support@easyshop.com' },
];

export const Navbar = ({ search, onSearchChange }: NavbarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onLogout = () => {
    logout();
    setShowDropdown(false);
    setMenuOpen(false);
    navigate('/login');
  };

  const handleMouseEnter = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    hideTimer.current = setTimeout(() => setShowDropdown(false), 200);
  };

  const initials = user
    ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
    : 'G';

  const roleBadgeClass = hasAdminAccess(user)
    ? 'bg-sky-100 text-sky-700'
    : 'bg-emerald-100 text-emerald-700';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-[0_12px_40px_-20px_rgba(79,70,229,0.45)]' : ''
      }`}
    >
      <div className="bg-gradient-to-r from-slate-950 via-sky-700 to-emerald-500 text-center text-xs font-semibold text-white">
        <div className="app-shell py-1.5">Free shipping over $80</div>
      </div>

      <div className="border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="app-shell py-3">
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="rounded-xl bg-white/80 px-3 py-2 text-xl font-extrabold tracking-tight text-gray-900 ring-1 ring-gray-200/70 transition-all duration-200 hover:ring-indigo-200"
            >
              Easy
              <span className="bg-gradient-to-r from-sky-700 to-emerald-500 bg-clip-text text-transparent">Shop</span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_ITEMS.map((item) => {
                if ('href' in item) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="group relative rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 transition-colors duration-200 hover:text-indigo-600"
                    >
                      {item.label}
                      <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-transform duration-200 group-hover:scale-x-100" />
                    </a>
                  );
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/home'}
                    className={({ isActive }) =>
                      `group relative rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                        isActive ? 'text-sky-700' : 'text-gray-600 hover:text-sky-600'
                      }`
                    }
                  >
                    {item.label}
                    <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-transform duration-200 group-hover:scale-x-100" />
                  </NavLink>
                );
              })}
            </nav>

            <div className="relative hidden min-w-[220px] flex-1 md:block lg:max-w-md lg:flex-none">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border border-white/60 bg-white/90 py-2 pl-9 pr-4 text-sm font-medium text-gray-900 outline-none ring-1 ring-gray-200/80 transition-all duration-200 focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                aria-label="Search products"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              {hasAdminAccess(user) ? (
                <Link
                  to="/admin/dashboard"
                  className="hidden rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-sky-700 transition-all duration-200 hover:bg-sky-100 md:inline-flex"
                >
                  Admin
                </Link>
              ) : null}

              <Link
                to="/cart"
                className="relative rounded-xl p-2 text-gray-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-sky-600"
              >
                <ShoppingCart size={20} />
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-sky-600 to-emerald-500 px-1 text-xs font-bold text-white">
                  {totalItems}
                </span>
              </Link>

              <div
                className="relative hidden sm:block"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-white/85 px-3 py-2 ring-1 ring-gray-200/80 transition-all duration-200 hover:ring-sky-200"
                  type="button"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-sky-600 to-emerald-500 text-xs font-black text-white">
                    {initials}
                  </span>
                  <span className="max-w-[120px] truncate text-sm font-semibold text-gray-800">
                    {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
                  </span>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>

                <AnimatePresence>
                  {showDropdown && user && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-white/50 bg-white/95 p-2 shadow-2xl backdrop-blur"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
                      >
                        <User size={14} />
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
                      >
                        <ShoppingCart size={14} />
                        Orders
                      </Link>
                      <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                        type="button"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                      <div className="mt-2 border-t border-gray-100 px-3 pt-2">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${roleBadgeClass}`}>
                          {user.role ?? 'CUSTOMER'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="rounded-xl p-2 text-gray-700 ring-1 ring-gray-200 transition-colors hover:bg-white lg:hidden"
                type="button"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
            </div>
          </div>

          <div className="relative mt-3 md:hidden">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-white/60 bg-white/90 py-2 pl-9 pr-4 text-sm font-medium text-gray-900 outline-none ring-1 ring-gray-200/80 transition-all duration-200 focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
              aria-label="Search products"
            />
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="mt-3 overflow-hidden rounded-2xl border border-white/50 bg-white/90 p-3 shadow-lg backdrop-blur lg:hidden"
              >
                <div className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    if ('href' in item) {
                      return (
                        <a
                          key={item.label}
                          href={item.href}
                          className="block rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
                        >
                          {item.label}
                        </a>
                      );
                    }

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        end={item.to === '/home'}
                        className={({ isActive }) =>
                          `block rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                            isActive
                              ? 'bg-sky-50 text-sky-700'
                              : 'text-gray-700 hover:bg-sky-50 hover:text-sky-700'
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    );
                  })}

                  <div className="my-2 border-t border-gray-100" />

                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    Orders
                  </Link>
                  {hasAdminAccess(user) ? (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50"
                    >
                      Admin Panel
                    </Link>
                  ) : null}
                  <button
                    onClick={onLogout}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                    type="button"
                  >
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

