import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbOrder {
  id: string;
  order_number: string;
  total: number;
  total_cost: number;
  created_at: string;
  items: { product_id: string | null; product_name: string; quantity: number; unit_price: number; cost_price: number }[];
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async (): Promise<DbOrder[]> => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: items } = await supabase.from("order_items").select("*");

      return (orders || []).map((o) => ({
        ...o,
        items: (items || []).filter((i) => i.order_id === o.id),
      }));
    },
  });
}

export function useAddOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      order_number: string;
      total: number;
      total_cost: number;
      items: { product_id?: string; product_name: string; quantity: number; unit_price: number; cost_price: number }[];
    }) => {
      const { items, ...order } = input;
      const { data, error } = await supabase.from("orders").insert(order).select().single();
      if (error) throw error;
      if (items.length > 0) {
        await supabase.from("order_items").insert(
          items.map((i) => ({ ...i, order_id: data.id }))
        );
      }
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
