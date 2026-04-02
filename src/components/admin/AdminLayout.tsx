import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

export const AdminLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden h-full w-[260px] shrink-0 lg:block">
        <AdminSidebar />
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[260px] overflow-y-auto bg-white shadow-lg">
            <AdminSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <main className="min-w-0 flex-1 overflow-y-auto p-4 lg:p-8">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="mb-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm lg:hidden"
        >
          {open ? <X size={16} /> : <Menu size={16} />}
          Menu
        </button>
        <Outlet />
      </main>
    </div>
  );
};
