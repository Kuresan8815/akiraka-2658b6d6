import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
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

  return session ? children : <Navigate to="/login" />;
};