
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminProducts } from "@/pages/admin/Products";
import { AdminAnalytics } from "@/pages/admin/Analytics";
import { AdminSettings } from "@/pages/admin/Settings";
import { AdminRewards } from "@/pages/admin/Rewards";
import { AdminWidgets } from "@/pages/admin/Widgets";
import { AdminData } from "@/pages/admin/Data";
import { Reports } from "@/pages/admin/Reports";
import BusinessLogin from "@/pages/admin/BusinessLogin";
import { Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AdminRoutes = () => {
  const { data: adminLevel, isLoading } = useQuery({
    queryKey: ["admin-level"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("account_level")
        .eq("id", user.id)
        .single();

      return adminUser?.account_level;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="login" element={<BusinessLogin />} />
      
      {/* Protected Admin Routes */}
      <Route path="" element={
        adminLevel ? (
          <AdminLayout role="admin">
            <AdminDashboard />
          </AdminLayout>
        ) : (
          <Navigate to="/admin/login" replace />
        )
      } />
      
      <Route path="dashboard" element={
        adminLevel ? (
          <AdminLayout role="admin">
            <AdminDashboard />
          </AdminLayout>
        ) : (
          <Navigate to="/admin/login" replace />
        )
      } />
      
      <Route path="products" element={
        adminLevel ? (
          <AdminLayout role="admin">
            <AdminProducts />
          </AdminLayout>
        ) : (
          <Navigate to="/admin/login" replace />
        )
      } />
      
      <Route path="widgets" element={
        adminLevel ? (
          <AdminLayout role="admin">
            <AdminWidgets />
          </AdminLayout>
        ) : (
          <Navigate to="/admin/login" replace />
        )
      } />
      
      <Route path="data" element={
        adminLevel ? (
          <AdminLayout role="admin">
            <AdminData />
          </AdminLayout>
        ) : (
          <Navigate to="/admin/login" replace />
        )
      } />
      
      <Route path="reports" element={
        adminLevel ? (
          <AdminLayout role="admin">
            <Reports />
          </AdminLayout>
        ) : (
          <Navigate to="/admin/login" replace />
        )
      } />
      
      <Route path="analytics" element={
        adminLevel ? (
          <AdminLayout role="admin">
            <AdminAnalytics />
          </AdminLayout>
        ) : (
          <Navigate to="/admin/login" replace />
        )
      } />
      
      <Route path="rewards" element={
        adminLevel ? (
          <AdminLayout role="admin">
            <AdminRewards />
          </AdminLayout>
        ) : (
          <Navigate to="/admin/login" replace />
        )
      } />
      
      <Route path="settings" element={
        adminLevel ? (
          <AdminLayout role="admin">
            <AdminSettings />
          </AdminLayout>
        ) : (
          <Navigate to="/admin/login" replace />
        )
      } />

      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};
