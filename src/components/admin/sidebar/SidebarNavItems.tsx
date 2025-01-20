import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  BarChart, 
  Settings,
  Gift,
  Globe,
  Building2,
  LayoutGrid,
  Leaf
} from "lucide-react";

interface SidebarNavItemsProps {
  adminLevel?: string;
}

export const SidebarNavItems = ({ adminLevel }: SidebarNavItemsProps) => {
  return (
    <div className="space-y-2">
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

      <Link to="/admin/carbon">
        <Button variant="ghost" className="w-full justify-start">
          <Leaf className="mr-2 h-4 w-4" />
          Carbon Footprint
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
    </div>
  );
};