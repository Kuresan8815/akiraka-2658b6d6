import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const PrivateRoute = () => {
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return session ? <Outlet /> : <Navigate to="/login" />;
};