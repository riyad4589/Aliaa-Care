import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BannerSettings {
  id: string;
  enabled: boolean;
  message: string;
}

export function useBanner() {
  return useQuery({
    queryKey: ["banner"],
    queryFn: async (): Promise<BannerSettings> => {
      const { data, error } = await supabase
        .from("banner_settings")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled, message }: { id: string; enabled: boolean; message: string }) => {
      const { error } = await supabase.from("banner_settings").update({ enabled, message }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banner"] }),
  });
}
