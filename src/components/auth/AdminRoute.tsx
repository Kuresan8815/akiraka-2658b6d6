import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { data: adminUser, isLoading } = useQuery({
    queryKey: ['admin-user'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      const { data } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return adminUser ? children : <Navigate to="/admin/login" />;
};