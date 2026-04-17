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

    const body = `*ALIAA Natural Care* 🌿\n` +
      `---------------------------\n` +
      `Bonjour *${order.customer_name}*,\n\n` +
      `Nous avons bien reçu votre commande *#${order.order_number}*.\n\n` +
      `📦 *Détails :*\n${itemsList}\n\n` +
      `💰 *Total : ${order.total.toLocaleString()} DH*\n` +
      `📍 *Livraison :* ${order.customer_city}\n\n` +
      `---------------------------\n` +
      `✅ Votre commande est en cours de traitement.\n` +
      `📞 *Un conseiller ALIAA vous contactera très prochainement sur ce numéro pour confirmer les détails de votre livraison.*\n\n` +
      `---------------------------\n` +
      `_L'équipe ALIAA vous remercie pour votre confiance !_`;

    // Formatage du numéro de téléphone
    let phone = order.customer_phone || ""; 
    let cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.startsWith("0")) cleanedPhone = "212" + cleanedPhone.substring(1);
    if (cleanedPhone.length === 9) cleanedPhone = "212" + cleanedPhone;

    // 1. Envoi du message principal (chat)
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
    console.log("UltraMsg Chat result:", result);

    // 2. Ajout d'une réaction (⏳) pour montrer que c'est en attente
    if (result.sent === "true" && result.id) {
      try {
        const reactionUrl = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/reaction`;
        const reactionParams = new URLSearchParams();
        reactionParams.append("token", ULTRAMSG_TOKEN || "");
        reactionParams.append("msgId", result.id);
        reactionParams.append("emoji", "⏳");

        await fetch(reactionUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: reactionParams.toString(),
        });
      } catch (e) {
        console.error("Failed to send reaction:", e);
      }
    }

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
