import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminUsers } from "@/pages/admin/Users";
import { AdminProducts } from "@/pages/admin/Products";
import { AdminAnalytics } from "@/pages/admin/Analytics";
import { AdminSettings } from "@/pages/admin/Settings";
import { AdminRewards } from "@/pages/admin/Rewards";
import { Routes, Route, Navigate } from "react-router-dom";

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <AdminLayout role="admin">
          <AdminDashboard />
        </AdminLayout>
      } />
      <Route path="users" element={
        <AdminLayout role="admin">
          <AdminUsers />
        </AdminLayout>
      } />
      <Route path="products" element={
        <AdminLayout role="admin">
          <AdminProducts />
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
      {/* Add a catch-all route for admin paths */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};