import { Home, QrCode, Gift, Clock, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { name: "Dashboard", icon: Home, path: "/" },
  { name: "Scan", icon: QrCode, path: "/scan" },
  { name: "Rewards", icon: Gift, path: "/rewards" },
  { name: "History", icon: Clock, path: "/history" },
  { name: "Profile", icon: User, path: "/profile" },
];

export const TabNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-eco-primary" : "text-gray-500"
              }`}
              aria-label={tab.name}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-eco-primary" : "text-gray-500"}`} />
              <span className="text-xs">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};