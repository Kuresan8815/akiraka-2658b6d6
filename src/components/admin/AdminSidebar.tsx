import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  BarChart, 
  Settings,
  LogOut,
  Gift,
  Globe,
  Building2,
  LayoutGrid
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

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

      <nav className="space-y-2">
        <Link to="/admin">
          <Button variant="ghost" className="w-full justify-start">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>

        {adminLevel === "super_admin" && (
          <>
            <Link to="/admin/regions">
              <Button variant="ghost" className="w-full justify-start">
                <Globe className="mr-2 h-4 w-4" />
                Regions
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Users
              </Button>
            </Link>
          </>
        )}

        {adminLevel === "regional_admin" && (
          <Link to="/admin/businesses">
            <Button variant="ghost" className="w-full justify-start">
              <Building2 className="mr-2 h-4 w-4" />
              Businesses
            </Button>
          </Link>
        )}

        <Link to="/admin/products">
          <Button variant="ghost" className="w-full justify-start">
            <Package className="mr-2 h-4 w-4" />
            Products
          </Button>
        </Link>

        <Link to="/admin/widgets">
          <Button variant="ghost" className="w-full justify-start">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Widgets
          </Button>
        </Link>

        <Link to="/admin/analytics">
          <Button variant="ghost" className="w-full justify-start">
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </Link>

        <Link to="/admin/rewards">
          <Button variant="ghost" className="w-full justify-start">
            <Gift className="mr-2 h-4 w-4" />
            Rewards & Loyalty
          </Button>
        </Link>

        <Link to="/admin/settings">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>

        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </nav>
    </div>
  );
};