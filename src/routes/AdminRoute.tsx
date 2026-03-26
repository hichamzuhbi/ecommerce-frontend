import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../hooks/useAuth';
import { hasAdminAccess } from '../utils/auth.utils';

export const AdminRoute = () => {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAdminAccess(user)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};
