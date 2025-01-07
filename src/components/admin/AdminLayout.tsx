import { useQuery } from "@tanstack/react-query";
import { AdminSidebar } from "./AdminSidebar";
import { AdminDashboard } from "./AdminDashboard";
import { supabase } from "@/integrations/supabase/client";

export const AdminLayout = () => {
  const { data: adminUser } = useQuery({
    queryKey: ["admin-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data } = await supabase
        .from("admin_users")
        .select("role")
        .eq("id", user.id)
        .single();
      
      return data;
    },
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar role={adminUser?.role || 'business_user'} />
      <main className="flex-1 overflow-y-auto">
        <AdminDashboard />
      </main>
    </div>
  );
};