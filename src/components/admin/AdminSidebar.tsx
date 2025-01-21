import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { SidebarNavItems } from "./sidebar/SidebarNavItems";

export const AdminSidebar = ({ role }: { role: string }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: adminLevel } = useQuery({
    queryKey: ["admin-level"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("admin_users")
        .select("account_level")
        .eq("id", user.id)
        .single();

      return data?.account_level;
    },
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/admin/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-eco-primary">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {adminLevel === "super_admin" 
            ? "Super Admin" 
            : adminLevel === "regional_admin" 
              ? "Regional Admin" 
              : role}
        </p>
      </div>

      <nav>
        <SidebarNavItems adminLevel={adminLevel} />
        
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 mt-2"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </nav>
    </div>
  );
};