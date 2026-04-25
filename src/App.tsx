import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ScrollToTop } from "./components/ScrollToTop";
import { LanguageSelector } from "./components/LanguageSelector";
import { AuthProvider } from "./context/AuthContext";
import { AdminGuard } from "./components/auth/AdminGuard";
import { GuestGuard } from "./components/auth/GuestGuard";
import { ClientLayout } from "./components/layout/ClientLayout";
import { AdminLayout } from "./components/layout/AdminLayout";

import { lazy, Suspense } from "react";

// Client Pages
const Index = lazy(() => import("./pages/Index"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const About = lazy(() => import("./pages/About"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const PackDetail = lazy(() => import("./pages/PackDetail"));
const Packs = lazy(() => import("./pages/Packs"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Auth Pages
const Login = lazy(() => import("./pages/Auth/Login"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminFinances = lazy(() => import("./pages/AdminFinances"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminPacks = lazy(() => import("./pages/AdminPacks"));
const AdminPromoCodes = lazy(() => import("./pages/AdminPromoCodes"));
const AdminPackaging = lazy(() => import("./pages/AdminPackaging"));
const AdminPromotions = lazy(() => import("./pages/AdminPromotions"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));

const queryClient = new QueryClient();

const HostnameRedirect = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname === "admin.riyadmaj.online" && pathname === "/") {
      navigate("/admin", { replace: true });
    }
  }, [navigate, pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageSelector />
        <BrowserRouter>
          <HostnameRedirect />
          <ScrollToTop />
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth" element={<GuestGuard><OutletWrapper /></GuestGuard>}>
                <Route path="login" element={<Login />} />
                <Route index element={<Navigate to="/auth/login" replace />} />
              </Route>

              {/* Client Routes */}
              <Route path="/" element={<ClientLayout />}>
                <Route index element={<Index />} />
                <Route path="products" element={<Products />} />
                <Route path="product/:slug" element={<ProductDetail />} />
                <Route path="about" element={<About />} />
                <Route path="cart" element={<Cart />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="packs" element={<Packs />} />
                <Route path="pack/:slug" element={<PackDetail />} />
                <Route path="track-order" element={<TrackOrder />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="finances" element={<AdminFinances />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="packs" element={<AdminPacks />} />
                <Route path="promo-codes" element={<AdminPromoCodes />} />
                <Route path="packaging" element={<AdminPackaging />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="orders" element={<AdminOrders />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Small helper for auth routes since they don't have a shared layout yet
import { Outlet } from "react-router-dom";
const OutletWrapper = () => <Outlet />;

export default App;
