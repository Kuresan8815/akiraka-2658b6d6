
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
      
      // Use the check_admin_user_access function
      const { data, error } = await supabase
        .rpc('check_admin_user_access', {
          user_id: session.user.id
        });
      
      if (error) {
        console.error('Error checking admin access:', error);
        return null;
      }
      
      return data ? { role: 'admin' } : null;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return adminUser ? children : <Navigate to="/admin/login" />;
};
