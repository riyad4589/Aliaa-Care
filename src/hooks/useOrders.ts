import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbOrder {
  id: string;
  order_number: string;
  total: number;
  total_cost: number;
  created_at: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  notes?: string;
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

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DbOrder['status'] }) => {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useAddOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      order_number: string;
      total: number;
      total_cost: number;
      customer_name: string;
      customer_phone: string;
      customer_address: string;
      customer_city: string;
      notes?: string;
      items: { product_id?: string; product_name: string; quantity: number; unit_price: number; cost_price: number }[];
    }) => {
      const { items, ...order } = input;
      const { data, error } = await supabase.from("orders").insert({ ...order, status: 'pending' }).select().single();
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
