import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ULTRAMSG_INSTANCE_ID = Deno.env.get("ULTRAMSG_INSTANCE_ID");
const ULTRAMSG_TOKEN = Deno.env.get("ULTRAMSG_TOKEN");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Webhook payload received:", payload);

    // Le webhook Supabase envoie la ligne insérée dans payload.record
    const order = payload.record;
    if (!order) throw new Error("No order record found in payload");

    // Initialisation du client Supabase interne
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Récupération des articles de la commande
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    if (itemsError) throw itemsError;

    // Préparation du message UltraMsg
    const itemsList = items
      .map((item: any) => `• ${item.quantity}x ${item.product_name} (${item.unit_price} DH)`)
      .join("\n");

    const body = `*Nouvelle commande chez ALIAA Natural Care* 🌿\n\n` +
      `Bonjour ${order.customer_name},\n` +
      `Merci pour votre commande *#${order.order_number}*.\n\n` +
      `*Détails :*\n${itemsList}\n\n` +
      `💰 *Total : ${order.total.toLocaleString()} DH*\n` +
      `📍 *Adresse :* ${order.customer_address}, ${order.customer_city}\n\n` +
      `*Veuillez confirmer votre commande via l'un des liens ci-dessous :*\n\n` +
      `✅ *Valider la commande :* https://wa.me/212623315600?text=Je%20valide%20ma%20commande%20${order.order_number}\n\n` +
      `❌ *Rejeter la commande :* https://wa.me/212623315600?text=Je%20souhaite%20annuler%20ma%20commande%20${order.order_number}`;

    // Formatage du numéro de téléphone
    let phone = order.customer_phone || ""; 
    let cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.startsWith("0")) cleanedPhone = "212" + cleanedPhone.substring(1);
    if (cleanedPhone.length === 9) cleanedPhone = "212" + cleanedPhone;

    // Appel à UltraMsg (Utilisation du format Chat pour compatibilité maximale)
    const ultraMsgUrl = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`;
    const params = new URLSearchParams();
    params.append("token", ULTRAMSG_TOKEN || "");
    params.append("to", cleanedPhone);
    params.append("body", body);

    const response = await fetch(ultraMsgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.json();
    console.log("UltraMsg API result:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in Edge Function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
