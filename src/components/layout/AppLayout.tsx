import { Outlet } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { session, isLoading } = useAuthSession();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {children || <Outlet />}
    </div>
  );
};