import { useLocation, useNavigate } from "react-router-dom";
import { Home, QrCode, Gift, History, User } from "lucide-react";

export const TabNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { icon: Home, label: "Home", path: "/" },
    { icon: QrCode, label: "Scan", path: "/scan" },
    { icon: Gift, label: "Rewards", path: "/rewards" },
    { icon: History, label: "History", path: "/history" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {tabs.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-eco-primary" : "text-gray-500"
              }`}
              onClick={() => navigate(path)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};