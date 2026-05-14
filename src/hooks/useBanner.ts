import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BannerSettings {
  id: string;
  enabled: boolean;
  message: string;
  scrolling_enabled: boolean;
  text_color: string;
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
          text_color: "#FFFFFF"
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
      if (!id) {
        const { error } = await supabase.from("banner_settings").insert(data);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banner_settings").update(data).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banner"] }),
  });
}
