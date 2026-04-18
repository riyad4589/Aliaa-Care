import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { LanguageSelector } from "./components/LanguageSelector";
import { AuthProvider } from "./context/AuthContext";
import { AdminGuard } from "./components/auth/AdminGuard";
import { GuestGuard } from "./components/auth/GuestGuard";
import { ClientLayout } from "./components/layout/ClientLayout";
import { AdminLayout } from "./components/layout/AdminLayout";

// Client Pages
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import PackDetail from "./pages/PackDetail";
import Packs from "./pages/Packs";
import TrackOrder from "./pages/TrackOrder";
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/Auth/Login";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminFinances from "./pages/AdminFinances";
import AdminCategories from "./pages/AdminCategories";
import AdminPacks from "./pages/AdminPacks";
import AdminPromoCodes from "./pages/AdminPromoCodes";
import AdminPackaging from "./pages/AdminPackaging";
import AdminPromotions from "./pages/AdminPromotions";
import AdminOrders from "./pages/AdminOrders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageSelector />
        <BrowserRouter>
          <ScrollToTop />
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Small helper for auth routes since they don't have a shared layout yet
import { Outlet } from "react-router-dom";
const OutletWrapper = () => <Outlet />;

export default App;
