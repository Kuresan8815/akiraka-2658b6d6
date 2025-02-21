
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
  Database,
  FileText
} from "lucide-react";

interface SidebarNavItemsProps {
  adminLevel?: string;
}

export const SidebarNavItems = ({ adminLevel }: SidebarNavItemsProps) => {
  if (adminLevel === "super_admin") {
    return (
      <div className="space-y-2">
        <Link to="/admin">
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
        <Link to="/admin/settings">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Link to="/admin">
        <Button variant="ghost" className="w-full justify-start">
          <Building2 className="mr-2 h-4 w-4" />
          Business Profile
        </Button>
      </Link>
      <Link to="/admin/users">
        <Button variant="ghost" className="w-full justify-start">
          <Users className="mr-2 h-4 w-4" />
          Users
        </Button>
      </Link>
      <Link to="/admin/products">
        <Button variant="ghost" className="w-full justify-start">
          <Package className="mr-2 h-4 w-4" />
          Products
        </Button>
      </Link>
      <Link to="/admin/widgets">
        <Button variant="ghost" className="w-full justify-start">
          <LayoutGrid className="mr-2 h-4 w-4" />
          Metrics
        </Button>
      </Link>
      <Link to="/admin/reports">
        <Button variant="ghost" className="w-full justify-start">
          <FileText className="mr-2 h-4 w-4" />
          Reports
        </Button>
      </Link>
      <Link to="/admin/data">
        <Button variant="ghost" className="w-full justify-start">
          <Database className="mr-2 h-4 w-4" />
          Data
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
    </div>
  );
};
