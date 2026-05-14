import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbPack {
  id: string;
  name: string;
  name_ar?: string | null;
  name_en?: string | null;
  slug: string;
  description: string;
  description_ar?: string | null;
  description_en?: string | null;
  long_description: string;
  long_description_ar?: string | null;
  long_description_en?: string | null;
  price: number;
  image: string;
  active: boolean;
  featured: boolean;
  created_at: string;
  items: DbPackItem[];
}

export interface DbPackItem {
  id: string;
  pack_id: string;
  product_id: string;
  quantity: number;
  product_name?: string;
  product_image?: string;
  product_price?: number;
}

async function fetchPacks(): Promise<DbPack[]> {
  const { data, error } = await supabase
    .from("packs")
    .select(`
      *,
      items:pack_items(
        *,
        product:products(
          id, name, price, slug,
          images:product_images(image_url, position)
        )
      )
    `)
    .order("created_at", { ascending: false })
    .order("position", { foreignTable: "pack_items.product.images", ascending: true });

  if (error) throw error;

  return (data || []).map((pack) => ({
    ...pack,
    description: pack.description || "",
    long_description: pack.long_description || "",
    image: pack.image || "/placeholder.svg",
    featured: pack.featured ?? false,
    items: (pack.items || []).map((item) => ({
      ...item,
      product_name: item.product?.name || "Produit inconnu",
      product_image: item.product?.images?.[0]?.image_url || "/placeholder.svg",
      product_price: item.product?.price || 0,
    })),
  })) as unknown as DbPack[];
}

export function usePacks() {
  return useQuery({ 
    queryKey: ["packs"], 
    queryFn: fetchPacks,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAddPack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string; slug: string; description: string; long_description: string;
      price: number; image: string; active: boolean; featured: boolean;
      product_ids: string[];
      name_ar?: string;
      name_en?: string;
      description_ar?: string;
      description_en?: string;
      long_description_ar?: string;
      long_description_en?: string;
    }) => {
      const { product_ids, ...packData } = input;
      const { data, error } = await supabase
        .from("packs")
        .insert(packData)
        .select()
        .single();
      if (error) throw error;

      if (product_ids.length > 0 && data) {
        const items = product_ids.map((pid) => ({ pack_id: data.id, product_id: pid, quantity: 1 }));
        const { error: itemsError } = await supabase.from("pack_items").insert(items);
        if (itemsError) throw itemsError;
      }
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packs"] }),
  });
}

export function useUpdatePack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      updates: { name: string; slug: string; description: string; long_description: string; price: number; image: string; active: boolean; featured: boolean; name_ar?: string | null; name_en?: string | null; description_ar?: string | null; description_en?: string | null; long_description_ar?: string | null; long_description_en?: string | null };
      product_ids: string[];
    }) => {
      const { error } = await supabase
        .from("packs")
        .update(input.updates)
        .eq("id", input.id);
      if (error) throw error;

      await supabase.from("pack_items").delete().eq("pack_id", input.id);
      if (input.product_ids.length > 0) {
        const items = input.product_ids.map((pid) => ({ pack_id: input.id, product_id: pid, quantity: 1 }));
        await supabase.from("pack_items").insert(items);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packs"] }),
  });
}

export function useDeletePack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("packs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packs"] }),
  });
}

export function useBulkDeletePacks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("packs").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packs"] }),
  });
}

export function useTogglePackActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("packs").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packs"] }),
  });
}
