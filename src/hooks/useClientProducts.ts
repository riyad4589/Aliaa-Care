import { useAdminStore } from "@/hooks/useAdminStore";
import { Product, Collection } from "@/data/products";

/** Returns only active+visible products and active collections from admin store */
export function useClientProducts() {
  const { products, collections, banner } = useAdminStore();

  const clientProducts: Product[] = products
    .filter((p) => p.active && p.visible)
    .map(({ stock, active, visible, costPrice, ...rest }) => rest);

  const clientCollections: Collection[] = collections
    .filter((c) => c.active)
    .map(({ active, ...rest }) => rest);

  const getProductBySlug = (slug: string) => clientProducts.find((p) => p.slug === slug);
  const getCollectionBySlug = (slug: string) => clientCollections.find((c) => c.slug === slug);
  const getFeaturedProducts = () => clientProducts.filter((p) => p.featured);
  const getNewProducts = () => clientProducts.filter((p) => p.new);
  const getRelatedProducts = (productId: string, limit = 4) => {
    const product = clientProducts.find((p) => p.id === productId);
    if (!product) return [];
    return clientProducts.filter((p) => p.collection === product.collection && p.id !== productId).slice(0, limit);
  };

  const isOutOfStock = (productId: string) => {
    const p = products.find((p) => p.id === productId);
    return p ? !p.active || p.stock <= 0 : true;
  };

  return {
    products: clientProducts,
    collections: clientCollections,
    banner,
    getProductBySlug,
    getCollectionBySlug,
    getFeaturedProducts,
    getNewProducts,
    getRelatedProducts,
    isOutOfStock,
  };
}