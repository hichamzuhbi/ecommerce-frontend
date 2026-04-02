import { ArrowLeft, LayoutDashboard, LogOut, Package, ShoppingBag, Tag } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AdminSidebarProps {
  onNavigate?: () => void;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
    isActive ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-100'
  }`;

export const AdminSidebar = ({ onNavigate }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="flex h-full w-full flex-col border-r border-gray-200 bg-white p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xl font-black tracking-tight text-slate-900">EasyShop</p>
          <span className="mt-1 inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700">
            Admin
          </span>
        </div>
      </div>

      <nav className="space-y-1">
        <NavLink to="/admin/dashboard" className={navLinkClass} onClick={onNavigate}>
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>
        <NavLink to="/admin/products" className={navLinkClass} onClick={onNavigate}>
          <Package size={16} /> Products
        </NavLink>
        <NavLink to="/admin/categories" className={navLinkClass} onClick={onNavigate}>
          <Tag size={16} /> Categories
        </NavLink>
        <NavLink to="/admin/orders" className={navLinkClass} onClick={onNavigate}>
          <ShoppingBag size={16} /> Orders
        </NavLink>
      </nav>

      <div className="my-4 border-t border-gray-200" />

      <div className="space-y-1">
        <NavLink to="/home" className={navLinkClass} onClick={onNavigate}>
          <ArrowLeft size={16} /> Back to Store
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 transition-all duration-200 hover:bg-gray-100"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};
