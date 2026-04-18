import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TierRule {
  min_qty: number;
  discount_percent: number;
}

export interface Promotion {
  id: string;
  name: string;
  type: string; // percentage, flash, buy_x_get_y, tiered, product_of_day
  discount_percent: number;
  starts_at: string;
  ends_at: string;
  is_flash: boolean;
  buy_quantity: number | null;
  get_quantity: number | null;
  get_product_id: string | null;
  tier_rules: TierRule[] | null;
  target_type: string; // all, specific_products, specific_categories
  product_ids: string[];
  category_ids: string[];
  active: boolean;
  created_at: string;
}

function isPromoActive(p: Promotion): boolean {
  if (!p.active) return false;
  const now = new Date();
  return new Date(p.starts_at) <= now && new Date(p.ends_at) > now;
}

export function usePromotions() {
  return useQuery({
    queryKey: ["promotions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((d) => ({ 
        ...d, 
        tier_rules: d.tier_rules as unknown as TierRule[] | null 
      })) as Promotion[];
    },
  });
}

export function useActivePromotions() {
  const { data: all = [], ...rest } = usePromotions();
  const active = all.filter(isPromoActive);
  
  const getProductDiscount = (productId: string, categoryIds: string[] = []): number => {
    let maxDiscount = 0;
    for (const promo of active) {
      if (promo.type === "buy_x_get_y" || promo.type === "tiered") continue;
      let applies = false;
      if (promo.target_type === "all") applies = true;
      else if (promo.target_type === "specific_products" && promo.product_ids?.includes(productId)) applies = true;
      else if (promo.target_type === "specific_categories" && promo.category_ids?.some(cid => categoryIds.includes(cid))) applies = true;
      if (applies && (promo.discount_percent || 0) > maxDiscount) {
        maxDiscount = promo.discount_percent || 0;
      }
    }
    return maxDiscount;
  };

  const getFlashPromos = () => active.filter(p => p.is_flash);
  const getProductOfDay = () => active.find(p => p.type === "product_of_day");
  const getTieredPromos = () => active.filter(p => p.type === "tiered");
  const getBuyXGetYPromos = () => active.filter(p => p.type === "buy_x_get_y");

  const getTieredDiscount = (totalItems: number): number => {
    let maxDiscount = 0;
    for (const promo of getTieredPromos()) {
      if (!promo.tier_rules) continue;
      const sorted = [...promo.tier_rules].sort((a, b) => b.min_qty - a.min_qty);
      for (const tier of sorted) {
        if (totalItems >= tier.min_qty && tier.discount_percent > maxDiscount) {
          maxDiscount = tier.discount_percent;
          break;
        }
      }
    }
    return maxDiscount;
  };

  return {
    promotions: active,
    allPromotions: all,
    getProductDiscount,
    getFlashPromos,
    getProductOfDay,
    getTieredPromos,
    getBuyXGetYPromos,
    getTieredDiscount,
    ...rest,
  };
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Promotion, "id" | "created_at">) => {
      const { error } = await supabase.from("promotions").insert(input as unknown as Promotion);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotions"] }),
  });
}

export function useUpdatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Promotion> & { id: string }) => {
      const { error } = await supabase.from("promotions").update(updates as unknown as Partial<Promotion>).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotions"] }),
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promotions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotions"] }),
  });
}

export function useBulkDeletePromotions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("promotions").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotions"] }),
  });
}
