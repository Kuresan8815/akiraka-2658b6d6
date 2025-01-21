import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AdminRoutes } from "@/components/admin/AdminRoutes";
import AdminLogin from "@/pages/admin/Login";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import { Onboarding } from "@/pages/onboarding/Onboarding";
import { Scan } from "@/pages/scan/Scan";
import { ProductDetails } from "@/pages/products/ProductDetails";
import { Profile } from "@/pages/profile/Profile";
import { Rewards } from "@/pages/rewards/Rewards";
import History from "@/pages/History";
import { PrivateRoute } from "@/components/auth/PrivateRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import Index from "@/pages/Index";
import { AppLayout } from "@/components/layout/AppLayout";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminRoutes />
              </AdminRoute>
            } />

            {/* Protected User Routes */}
            <Route path="/*" element={
              <PrivateRoute>
                <AppLayout>
                  <Routes>
                    <Route path="dashboard" element={<UserDashboard />} />
                    <Route path="onboarding" element={<Onboarding />} />
                    <Route path="scan" element={<Scan />} />
                    <Route path="product/:id" element={<ProductDetails />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="rewards" element={<Rewards />} />
                    <Route path="history" element={<History />} />
                  </Routes>
                </AppLayout>
              </PrivateRoute>
            } />

            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;