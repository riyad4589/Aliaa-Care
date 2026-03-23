import { useProducts, DbProduct } from "@/hooks/useProducts";
import { useCategories, DbCategory } from "@/hooks/useCategories";
import { useBanner } from "@/hooks/useBanner";

export interface ClientProduct {
  id: string;
  name: string;
  slug: string;
  collection: string; // primary category id
  collections?: string[];
  price: number;
  originalPrice?: number;
  description: string;
  longDescription: string;
  materials: string;
  weight?: number;
  images: string[];
  featured?: boolean;
  new?: boolean;
}

export interface ClientCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  heroImage?: string;
}

function toClientProduct(p: DbProduct): ClientProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    collection: p.category_ids[0] || "",
    collections: p.category_ids,
    price: p.price,
    description: p.description || "",
    longDescription: p.long_description || "",
    materials: p.materials || "",
    weight: p.weight ?? undefined,
    images: p.images.length > 0 ? p.images : ["/placeholder.svg"],
    featured: p.featured ?? false,
    new: p.is_new ?? false,
  };
}

function toClientCollection(c: DbCategory): ClientCollection {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || "",
    image: c.image || "/placeholder.svg",
    heroImage: c.image || "/placeholder.svg",
  };
}

export function useClientProducts() {
  const { data: rawProducts = [], isLoading: productsLoading } = useProducts();
  const { data: rawCategories = [], isLoading: categoriesLoading } = useCategories();
  const { data: bannerData } = useBanner();

  const isLoading = productsLoading || categoriesLoading;

  const clientProducts = rawProducts
    .filter((p) => p.active && p.visible)
    .map(toClientProduct);

  const clientCollections = rawCategories
    .filter((c) => c.active)
    .map(toClientCollection);

  const banner = bannerData || { enabled: false, message: "" };

  const getProductBySlug = (slug: string) => clientProducts.find((p) => p.slug === slug);
  const getCollectionBySlug = (slug: string) => clientCollections.find((c) => c.slug === slug);
  const getFeaturedProducts = () => clientProducts.filter((p) => p.featured);
  const getNewProducts = () => clientProducts.filter((p) => p.new);
  const getRelatedProducts = (productId: string, limit = 4) => {
    const product = clientProducts.find((p) => p.id === productId);
    if (!product) return [];
    return clientProducts
      .filter((p) => p.collection === product.collection && p.id !== productId)
      .slice(0, limit);
  };

  const isOutOfStock = (productId: string) => {
    const p = rawProducts.find((p) => p.id === productId);
    return p ? !p.active || p.stock <= 0 : true;
  };

  return {
    products: clientProducts,
    collections: clientCollections,
    banner,
    isLoading,
    getProductBySlug,
    getCollectionBySlug,
    getFeaturedProducts,
    getNewProducts,
    getRelatedProducts,
    isOutOfStock,
  };
}
