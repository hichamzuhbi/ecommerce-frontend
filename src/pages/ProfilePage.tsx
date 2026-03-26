import { useState } from 'react';
import { Mail, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useAuth } from '../hooks/useAuth';
import { hasAdminAccess } from '../utils/auth.utils';

export const ProfilePage = () => {
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const initials = user
    ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
    : 'G';

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar search={search} onSearchChange={setSearch} />

      <PageWrapper>
        <section className="space-y-6 py-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Profile</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">My Profile</h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Manage your account details and review your activity.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-600 text-3xl font-black text-white">
                  {initials}
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
                </h2>
                <p className="mt-1 text-sm font-medium text-gray-500">{user?.email ?? 'No email available'}</p>
                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                    hasAdminAccess(user)
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {hasAdminAccess(user) ? 'ADMIN' : 'CUSTOMER'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">Account Information</h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-gray-500">
                      <UserRound size={16} />
                      <span className="text-xs font-bold uppercase tracking-wide">First Name</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{user?.firstName ?? '-'}</p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-gray-500">
                      <UserRound size={16} />
                      <span className="text-xs font-bold uppercase tracking-wide">Last Name</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{user?.lastName ?? '-'}</p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-gray-500">
                      <Mail size={16} />
                      <span className="text-xs font-bold uppercase tracking-wide">Email</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{user?.email ?? '-'}</p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-gray-500">
                      <ShieldCheck size={16} />
                      <span className="text-xs font-bold uppercase tracking-wide">Role</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{user?.role ?? 'CUSTOMER'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    to="/orders"
                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    View Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    Open Wishlist
                  </Link>
                  {hasAdminAccess(user) ? (
                    <Link
                      to="/admin/dashboard"
                      className="rounded-xl bg-purple-100 px-4 py-2.5 text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-200"
                    >
                      Go to Admin Panel
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      </PageWrapper>
    </main>
  );
};
