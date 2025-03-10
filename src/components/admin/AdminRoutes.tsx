
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminUsers } from "@/pages/admin/Users";
import { AdminProducts } from "@/pages/admin/Products";
import { AdminAnalytics } from "@/pages/admin/Analytics";
import { AdminSettings } from "@/pages/admin/Settings";
import { AdminRewards } from "@/pages/admin/Rewards";
import { AdminWidgets } from "@/pages/admin/Widgets";
import { AdminData } from "@/pages/admin/Data";
import { Reports } from "@/pages/admin/Reports";
import { SuperAdminDashboard } from "@/components/admin/SuperAdminDashboard";
import { BusinessProfileManager } from "@/components/business/BusinessProfileManager";
import { Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AdminRoutes = () => {
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

  return (
    <Routes>
      <Route path="/" element={
        <AdminLayout role="admin">
          <AdminDashboard />
        </AdminLayout>
      } />
      <Route path="dashboard" element={
        <AdminLayout role="admin">
          <AdminDashboard />
        </AdminLayout>
      } />
      {adminLevel === "super_admin" && (
        <>
          <Route path="users" element={
            <AdminLayout role="admin">
              <AdminUsers />
            </AdminLayout>
          } />
        </>
      )}
      <Route path="products" element={
        <AdminLayout role="admin">
          <AdminProducts />
        </AdminLayout>
      } />
      <Route path="widgets" element={
        <AdminLayout role="admin">
          <AdminWidgets />
        </AdminLayout>
      } />
      <Route path="data" element={
        <AdminLayout role="admin">
          <AdminData />
        </AdminLayout>
      } />
      <Route path="reports" element={
        <AdminLayout role="admin">
          <Reports />
        </AdminLayout>
      } />
      <Route path="analytics" element={
        <AdminLayout role="admin">
          <AdminAnalytics />
        </AdminLayout>
      } />
      <Route path="rewards" element={
        <AdminLayout role="admin">
          <AdminRewards />
        </AdminLayout>
      } />
      <Route path="settings" element={
        <AdminLayout role="admin">
          <AdminSettings />
        </AdminLayout>
      } />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};
