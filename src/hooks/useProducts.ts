import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  long_description: string | null;
  materials: string | null;
  weight: number | null;
  stock: number;
  active: boolean;
  visible: boolean;
  cost_price: number | null;
  featured: boolean | null;
  is_new: boolean | null;
  original_price: number | null;
  created_at: string;
  updated_at: string;
  // Joined data
  images: string[];
  category_ids: string[];
}

async function fetchProducts(): Promise<DbProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(image_url, position),
      categories:product_categories(category_id)
    `)
    .order("created_at", { ascending: false })
    .order("position", { foreignTable: "product_images", ascending: true });

  if (error) throw error;

  return (data || []).map((p) => ({
    ...p,
    images: (p.images || []).map((img) => img.image_url),
    category_ids: (p.categories || []).map((cat) => cat.category_id),
  })) as unknown as DbProduct[];
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Prevents loading spinner when switching tabs
  });
}

export function useAddProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      slug: string;
      price: number;
      description?: string;
      long_description?: string;
      materials?: string;
      weight?: number;
      stock?: number;
      active?: boolean;
      visible?: boolean;
      cost_price?: number;
      featured?: boolean;
      is_new?: boolean;
      images: string[];
      category_ids: string[];
    }) => {
      const { images, category_ids, ...product } = input;
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();
      if (error) throw error;

      if (images.length > 0) {
        await supabase.from("product_images").insert(
          images.map((url, i) => ({ product_id: data.id, image_url: url, position: i }))
        );
      }
      if (category_ids.length > 0) {
        await supabase.from("product_categories").insert(
          category_ids.map((cid) => ({ product_id: data.id, category_id: cid }))
        );
      }
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      updates: Partial<{ active: boolean; cost_price: number | null; description: string | null; featured: boolean | null; is_new: boolean | null; long_description: string | null; materials: string | null; name: string; original_price: number | null; price: number; slug: string; stock: number; visible: boolean; weight: number | null }>;
      images?: string[];
      category_ids?: string[];
    }) => {
      const { id, updates, images, category_ids } = input;
      const { error } = await supabase.from("products").update(updates).eq("id", id);
      if (error) throw error;

      if (images !== undefined) {
        await supabase.from("product_images").delete().eq("product_id", id);
        if (images.length > 0) {
          await supabase.from("product_images").insert(
            images.map((url, i) => ({ product_id: id, image_url: url, position: i }))
          );
        }
      }
      if (category_ids !== undefined) {
        await supabase.from("product_categories").delete().eq("product_id", id);
        if (category_ids.length > 0) {
          await supabase.from("product_categories").insert(
            category_ids.map((cid) => ({ product_id: id, category_id: cid }))
          );
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useBulkDeleteProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("products").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useToggleProductActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("products").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
