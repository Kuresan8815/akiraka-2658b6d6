import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminLogin from "./pages/admin/Login";
import { QRScanner } from "./components/QRScanner";
import { ProductDetails } from "./components/ProductDetails";
import Notifications from "./pages/Notifications";
import History from "./pages/History";
import { RewardsDashboard } from "./components/dashboard/RewardsDashboard";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Index />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <AdminLayout>
                {/* Admin routes will be added here in the next implementation */}
                <div>Admin Dashboard Content</div>
              </AdminLayout>
            }
          />
          <Route
            path="/scan"
            element={
              <AppLayout>
                <QRScanner />
              </AppLayout>
            }
          />
          <Route
            path="/product/:qrCodeId"
            element={
              <AppLayout>
                <ProductDetails />
              </AppLayout>
            }
          />
          <Route
            path="/notifications"
            element={
              <AppLayout>
                <Notifications />
              </AppLayout>
            }
          />
          <Route
            path="/history"
            element={
              <AppLayout>
                <History />
              </AppLayout>
            }
          />
          <Route
            path="/rewards"
            element={
              <AppLayout>
                <RewardsDashboard />
              </AppLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <AppLayout>
                <Profile />
              </AppLayout>
            }
          />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;