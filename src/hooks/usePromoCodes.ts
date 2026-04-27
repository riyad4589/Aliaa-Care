import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  applies_to: string;
  product_ids: string[];
  pack_ids: string[];
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

export const usePromoCodes = () => {
  return useQuery({
    queryKey: ["promo_codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PromoCode[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAddPromoCode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (promo: Omit<PromoCode, "id" | "created_at" | "current_uses">) => {
      const { data, error } = await supabase
        .from("promo_codes")
        .insert(promo)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promo_codes"] }),
  });
};

export const useDeletePromoCode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promo_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promo_codes"] }),
  });
};

export const useBulkDeletePromoCodes = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("promo_codes").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promo_codes"] }),
  });
};

export const useUpdatePromoCode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PromoCode> & { id: string }) => {
      const { error } = await supabase.from("promo_codes").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promo_codes"] }),
  });
};

export const useValidatePromoCode = () => {
  return useMutation({
    mutationFn: async (code: string): Promise<PromoCode> => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", code.toUpperCase().trim())
        .eq("active", true)
        .single();
      if (error || !data) throw new Error("Code promo invalide");
      const promo = data as PromoCode;
      if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        throw new Error("Code promo expiré");
      }
      if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
        throw new Error("Code promo épuisé");
      }
      return promo;
    },
  });
};

export const useIncrementPromoUsage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: current } = await supabase
        .from("promo_codes")
        .select("current_uses")
        .eq("id", id)
        .single();
      if (!current) return;
      const { error } = await supabase
        .from("promo_codes")
        .update({ current_uses: (current.current_uses as number) + 1 })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promo_codes"] }),
  });
};
