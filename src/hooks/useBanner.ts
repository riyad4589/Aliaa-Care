import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BannerSettings {
  id: string;
  enabled: boolean;
  message: string;
  scrolling_enabled: boolean;
  text_color: string;
  maintenance_mode: boolean;
  free_shipping_threshold: number;
}

export function useBanner() {
  return useQuery({
    queryKey: ["banner"],
    queryFn: async (): Promise<BannerSettings> => {
      const { data, error } = await supabase
        .from("banner_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      
      // Default if no settings exist
      if (!data) {
        return {
          id: "",
          enabled: true,
          message: "Livraison partout au Maroc 🚚",
          scrolling_enabled: false,
          text_color: "#FFFFFF",
          maintenance_mode: false,
          free_shipping_threshold: 500
        };
      }
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<BannerSettings>) => {
      const { id, ...data } = updates;
      // Check if a row exists in the database
      const { data: existing } = await supabase
        .from("banner_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const { error } = await supabase.from("banner_settings").update(data).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banner_settings").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banner"] }),
  });
}
