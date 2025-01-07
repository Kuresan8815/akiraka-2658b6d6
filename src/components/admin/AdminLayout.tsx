import { AdminSidebar } from "./AdminSidebar";
import { AdminDashboard } from "./AdminDashboard";

export const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <AdminDashboard />
      </main>
    </div>
  );
};