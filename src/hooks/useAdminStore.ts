import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products as defaultProducts, collections as defaultCollections, Product, Collection } from "@/data/products";

export interface AdminProduct extends Product {
  stock: number;
  active: boolean;
  visible: boolean;
  costPrice?: number;
}

export interface AdminCollection extends Collection {
  active: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: { productId: string; productName: string; quantity: number; unitPrice: number; costPrice: number }[];
  total: number;
  totalCost: number;
}

export interface BannerSettings {
  enabled: boolean;
  message: string;
}

interface AdminState {
  products: AdminProduct[];
  collections: AdminCollection[];
  orders: Order[];
  banner: BannerSettings;
  
  // Products
  addProduct: (product: AdminProduct) => void;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  toggleProductActive: (id: string) => void;
  toggleProductVisible: (id: string) => void;
  
  // Collections
  addCollection: (collection: AdminCollection) => void;
  updateCollection: (id: string, updates: Partial<AdminCollection>) => void;
  deleteCollection: (id: string) => void;
  
  // Orders
  addOrder: (order: Order) => void;
  
  // Banner
  updateBanner: (banner: BannerSettings) => void;
  
  // Helpers
  getLowStockProducts: () => AdminProduct[];
  getRevenue: (period: "day" | "month" | "year") => number;
  getRevenueByDay: (days: number) => { date: string; revenue: number; cost: number; profit: number }[];
  getMarginByProduct: () => { productId: string; productName: string; revenue: number; cost: number; margin: number }[];
}

const initProducts: AdminProduct[] = defaultProducts.map((p) => ({
  ...p,
  stock: Math.floor(Math.random() * 30) + 5,
  active: true,
  visible: true,
  costPrice: Math.round(p.price * 0.4),
}));

const initCollections: AdminCollection[] = defaultCollections.map((c) => ({
  ...c,
  active: true,
}));

// Generate sample orders
const generateSampleOrders = (): Order[] => {
  const orders: Order[] = [];
  const now = new Date();
  for (let i = 0; i < 45; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    const numItems = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let total = 0;
    let totalCost = 0;
    for (let j = 0; j < numItems; j++) {
      const p = initProducts[Math.floor(Math.random() * initProducts.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const cost = p.costPrice || Math.round(p.price * 0.4);
      items.push({ productId: p.id, productName: p.name, quantity: qty, unitPrice: p.price, costPrice: cost });
      total += p.price * qty;
      totalCost += cost * qty;
    }
    orders.push({ id: `ORD-${1000 + i}`, date: date.toISOString(), items, total, totalCost });
  }
  return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      products: initProducts,
      collections: initCollections,
      orders: generateSampleOrders(),
      banner: { enabled: false, message: "Bienvenue chez ALIAA Natural Care 🌿" },

      addProduct: (product) => set((s) => ({ products: [...s.products, product] })),
      updateProduct: (id, updates) =>
        set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)) })),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      toggleProductActive: (id) =>
        set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, active: !p.active } : p)) })),
      toggleProductVisible: (id) =>
        set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)) })),

      addCollection: (collection) => set((s) => ({ collections: [...s.collections, collection] })),
      updateCollection: (id, updates) =>
        set((s) => ({ collections: s.collections.map((c) => (c.id === id ? { ...c, ...updates } : c)) })),
      deleteCollection: (id) => set((s) => ({ collections: s.collections.filter((c) => c.id !== id) })),

      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      updateBanner: (banner) => set({ banner }),

      getLowStockProducts: () => get().products.filter((p) => p.stock < 5 && p.active),

      getRevenue: (period) => {
        const now = new Date();
        const start = new Date();
        if (period === "day") start.setHours(0, 0, 0, 0);
        else if (period === "month") { start.setDate(1); start.setHours(0, 0, 0, 0); }
        else { start.setMonth(0, 1); start.setHours(0, 0, 0, 0); }
        return get().orders.filter((o) => new Date(o.date) >= start && new Date(o.date) <= now).reduce((s, o) => s + o.total, 0);
      },

      getRevenueByDay: (days) => {
        const result: { date: string; revenue: number; cost: number; profit: number }[] = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split("T")[0];
          const dayOrders = get().orders.filter((o) => o.date.startsWith(key));
          const revenue = dayOrders.reduce((s, o) => s + o.total, 0);
          const cost = dayOrders.reduce((s, o) => s + o.totalCost, 0);
          result.push({ date: key, revenue, cost, profit: revenue - cost });
        }
        return result;
      },

      getMarginByProduct: () => {
        const map = new Map<string, { productName: string; revenue: number; cost: number }>();
        get().orders.forEach((o) =>
          o.items.forEach((item) => {
            const existing = map.get(item.productId) || { productName: item.productName, revenue: 0, cost: 0 };
            existing.revenue += item.unitPrice * item.quantity;
            existing.cost += item.costPrice * item.quantity;
            map.set(item.productId, existing);
          })
        );
        return Array.from(map.entries()).map(([productId, data]) => ({
          productId,
          ...data,
          margin: data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue) * 100 : 0,
        }));
      },
    }),
    { name: "aliaa-admin" }
  )
);