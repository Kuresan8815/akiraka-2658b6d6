import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "./AdminSidebar";

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: adminRole, isLoading } = useQuery({
    queryKey: ["adminRole", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_users")
        .select("role")
        .eq("id", session?.user?.id)
        .single();

      if (error) throw error;
      return data?.role;
    },
  });

  useEffect(() => {
    if (!isLoading && !adminRole) {
      navigate("/admin/login");
    }
  }, [adminRole, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar role={adminRole} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
};