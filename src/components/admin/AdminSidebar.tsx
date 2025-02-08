
import { Button } from "@/components/ui/button";
import { LogOut, Building2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { SidebarNavItems } from "./sidebar/SidebarNavItems";
import { BusinessSelector } from "./BusinessSelector";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const AdminSidebar = ({ role }: { role: string }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);

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

  const { data: currentBusiness } = useQuery({
    queryKey: ["current-business"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.current_business_id) return null;

      const { data, error } = await supabase
        .from("businesses")
        .select("name, industry_type")
        .eq("id", user.user_metadata.current_business_id)
        .single();

      if (error) throw error;
      return data;
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

      {currentBusiness && (
        <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center gap-2 justify-between cursor-pointer group" onClick={() => setShowBusinessSelector(true)}>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-eco-primary" />
              <div>
                <h2 className="text-sm font-medium text-gray-500">Current Business</h2>
                <p className="text-sm font-semibold text-eco-primary">{currentBusiness.name}</p>
                <p className="text-xs text-gray-500">{currentBusiness.industry_type}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-eco-primary transition-colors" />
          </div>
        </div>
      )}

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

      <Dialog open={showBusinessSelector} onOpenChange={setShowBusinessSelector}>
        <DialogContent className="sm:max-w-md">
          <div className="py-6">
            <h2 className="text-lg font-semibold mb-4">Switch Business</h2>
            <BusinessSelector />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
