import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Packaging {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  cost_price: number;
  stock: number;
  active: boolean;
  created_at: string;
}

export const usePackaging = () =>
  useQuery({
    queryKey: ["packaging"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packaging")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Packaging[];
    },
  });

export const useCreatePackaging = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<Packaging, "id" | "created_at">) => {
      const { error } = await supabase.from("packaging").insert(p);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packaging"] }),
  });
};

export const useUpdatePackaging = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Packaging> & { id: string }) => {
      const { error } = await supabase.from("packaging").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packaging"] }),
  });
};

export const useDeletePackaging = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("packaging").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packaging"] }),
  });
};

export const useBulkDeletePackaging = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("packaging").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packaging"] }),
  });
};
