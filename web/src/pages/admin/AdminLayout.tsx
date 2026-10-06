import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet } from 'react-router-dom';
import { api } from '../../api';

export function AdminLayout() {
  const me = useQuery({
    queryKey: ['admin-me'],
    queryFn: () => api<{ username: string }>('/api/admin/auth/me', {}, true),
    retry: false,
  });

  if (me.isLoading) return <p className="text-slate-400">Đang kiểm tra phiên...</p>;
  if (me.isError) return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}
