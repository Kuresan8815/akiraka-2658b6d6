
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { data: adminUser, isLoading } = useQuery({
    queryKey: ['admin-user'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      // Add console log to debug
      console.log('Checking admin access for user:', session.user.id);
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('account_level')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error checking admin access:', error);
        return null;
      }
      
      console.log('Admin data:', data);
      return data;
    },
    staleTime: 0, // Disable caching temporarily for debugging
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

