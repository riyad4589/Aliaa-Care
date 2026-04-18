import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Token is read server-side — never exposed to the client bundle
const ULTRAMSG_INSTANCE_ID = Deno.env.get("ULTRAMSG_INSTANCE_ID");
const ULTRAMSG_TOKEN = Deno.env.get("ULTRAMSG_TOKEN");

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

serve(async (req) => {
  // Handle CORS preflight
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
    if (!ULTRAMSG_INSTANCE_ID || !ULTRAMSG_TOKEN) {
      throw new Error(
        "UltraMsg credentials not configured as Edge Function secrets"
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
      `Veuillez confirmer la validité de cette commande :`;

    const buttons = [
      {
        buttonId: "confirm_order",
        buttonText: { displayText: "✅ Valider la commande" },
        type: 1,
      },
      {
        buttonId: "cancel_order",
        buttonText: { displayText: "❌ Rejeter la commande" },
        type: 1,
      },
    ];

    const apiUrl = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/buttons`;
    const params = new URLSearchParams();
    params.append("token", ULTRAMSG_TOKEN);
    params.append("to", cleanedPhone);
    params.append("body", body);
    params.append("footer", "ALIAA Natural Care - Qualité & Nature");
    params.append("buttons", JSON.stringify(buttons));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.json();
    console.log("UltraMsg response:", result);

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
