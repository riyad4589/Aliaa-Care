import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbPack {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string;
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
  const { data: packs, error } = await supabase
    .from("packs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const { data: items, error: itemsError } = await supabase
    .from("pack_items")
    .select("*");

  if (itemsError) throw itemsError;

  // Get product info for items
  const productIds = [...new Set((items || []).map((i) => i.product_id))];
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, slug")
    .in("id", productIds);

  const { data: productImages } = await supabase
    .from("product_images")
    .select("product_id, image_url, position")
    .in("product_id", productIds)
    .order("position", { ascending: true });

  const productMap = new Map((products || []).map((p) => [p.id, p]));
  const imageMap = new Map<string, string>();
  (productImages || []).forEach((img) => {
    if (!imageMap.has(img.product_id)) imageMap.set(img.product_id, img.image_url);
  });

  const enrichedItems = (items || []).map((item) => {
    const product = productMap.get(item.product_id);
    return {
      ...item,
      product_name: product?.name || "Produit inconnu",
      product_image: imageMap.get(item.product_id) || "/placeholder.svg",
      product_price: product?.price || 0,
    };
  });

  return (packs || []).map((pack) => ({
    ...pack,
    description: pack.description || "",
    long_description: pack.long_description || "",
    image: pack.image || "/placeholder.svg",
    featured: pack.featured ?? false,
    items: enrichedItems.filter((i) => i.pack_id === pack.id),
  }));
}

export function usePacks() {
  return useQuery({ queryKey: ["packs"], queryFn: fetchPacks });
}

export function useAddPack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string; slug: string; description: string; long_description: string;
      price: number; image: string; active: boolean; featured: boolean;
      product_ids: string[];
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
      updates: { name: string; slug: string; description: string; long_description: string; price: number; image: string; active: boolean; featured: boolean };
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
