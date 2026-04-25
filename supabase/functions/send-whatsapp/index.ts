import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// WAHA credentials — set via Supabase secrets
const WAHA_URL = Deno.env.get("WAHA_URL");
const WAHA_API_KEY = Deno.env.get("WAHA_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface OrderData {
  order_number: string;
  total: number;
  customerName: string;
  phone: string;
  address: string;
}

/**
 * Proxy Edge Function: called by the client (via supabase.functions.invoke)
 * to send a WhatsApp message via WAHA.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    if (!WAHA_URL || !WAHA_API_KEY) {
      throw new Error(
        "WAHA credentials not configured as Edge Function secrets"
      );
    }

    const { order, items }: { order: OrderData; items: OrderItem[] } =
      await req.json();

    if (!order || !items) {
      throw new Error("Missing order or items in request body");
    }

    // Format phone number to international format (e.g. 2126...)
    let cleanedPhone = order.phone.replace(/\D/g, "");
    if (cleanedPhone.startsWith("0"))
      cleanedPhone = "212" + cleanedPhone.substring(1);
    if (cleanedPhone.length === 9) cleanedPhone = "212" + cleanedPhone;

    const itemsList = items
      .map(
        (item) =>
          `• ${item.quantity}x ${item.product_name} (${item.unit_price} DH)`
      )
      .join("\n");

    const body =
      `*Nouvelle commande chez ALIAA Natural Care* 🌿\n\n` +
      `Bonjour ${order.customerName},\n` +
      `Merci pour votre commande *#${order.order_number}*.\n\n` +
      `*Détails :*\n${itemsList}\n\n` +
      `💰 *Total : ${order.total.toLocaleString()} DH*\n` +
      `📍 *Adresse :* ${order.address}\n\n` +
      `Votre commande est en cours de traitement. Nous vous contacterons bientôt pour la livraison.`;

    const apiUrl = `${WAHA_URL}/api/sendText`;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Api-Key": WAHA_API_KEY
      },
      body: JSON.stringify({
        chatId: `${cleanedPhone}@c.us`,
        text: body,
        session: "default"
      }),
    });

    const result = await response.json();
    console.log("WAHA response:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-whatsapp Edge Function:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
