import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ULTRAMSG_INSTANCE_ID = Deno.env.get("ULTRAMSG_INSTANCE_ID");
const ULTRAMSG_TOKEN = Deno.env.get("ULTRAMSG_TOKEN");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // --- GESTION DU CLIC SUR LE LIEN (GET) ---
  if (req.method === "GET") {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");
    const action = url.searchParams.get("action"); // "OUI" ou "NON"

    if (orderId && action) {
      const newStatus = action === "OUI" ? "confirmed" : "cancelled";

      await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId)
        .select()
        .single();

      const title = action === "OUI" ? "Commande Confirmée" : "Commande Annulée";
      const message = action === "OUI"
        ? "Merci ! Votre commande est maintenant en cours de préparation."
        : "Votre commande a bien été annulée. À bientôt !";
      const icon = action === "OUI" ? "✅" : "❌";

      return new Response(
        `<!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title} - ALIAA Natural Care</title>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; background-color: #FDFCFB; color: #1A1A1A; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .card { background: white; padding: 3rem; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 400px; width: 90%; }
            h1 { font-family: 'Playfair Display', serif; color: #C5A28E; margin-bottom: 1rem; font-size: 2rem; }
            .icon { font-size: 4rem; margin-bottom: 1.5rem; }
            p { color: #666; line-height: 1.6; margin-bottom: 2rem; }
            .btn { background-color: #1A1A1A; color: white; text-decoration: none; padding: 1rem 2rem; border-radius: 5px; font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase; transition: all 0.3s; }
            .btn:hover { opacity: 0.8; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">${icon}</div>
            <h1>${title}</h1>
            <p>${message}</p>
            <a href="https://aliaacare.com" class="btn">Retour à la boutique</a>
          </div>
        </body>
        </html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }
  }

  // --- GESTION DU WEBHOOK ULTRAMSG (POST) ---
  try {
    const payload = await req.json();
    console.log("UltraMsg Webhook received:", JSON.stringify(payload));

    // UltraMsg envoie souvent les données dans payload.data
    const data = payload.data || payload;
    const body = (data.body || "").trim().toUpperCase();
    const from = data.from || ""; // Format: 212600000000@c.us

    // Extraire le numéro de téléphone sans le @c.us
    const phone = from.split("@")[0];

    // On va chercher les commandes qui finissent par ce numéro
    const last9Digits = phone.slice(-9);

    const isYes = body.includes("OUI") || body.includes("CONFIRMER") || body.includes("تأكيد");
    const isNo = body.includes("NON") || body.includes("ANNULER") || body.includes("إلغاء");

    if (isYes || isNo) {
      const cleanBody = isYes ? "OUI" : "NON";

      console.log(`Searching order for phone suffix: ${last9Digits}`);

      // 1. Récupérer les commandes en attente
      const { data: allPendingOrders, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (orderError) throw orderError;

      // 2. Trouver la correspondance manuellement sur les 9 derniers chiffres
      const order = (allPendingOrders || []).find((o) => {
        const cleanDbPhone = (o.customer_phone || "").replace(/\D/g, "");
        return cleanDbPhone.endsWith(last9Digits);
      });

      if (order) {
        console.log(`Found order: ${order.order_number} for customer ${order.customer_name}`);
        const newStatus = cleanBody === "OUI" ? "confirmed" : "cancelled";

        // 3. Mettre à jour le statut
        const { error: updateError } = await supabase
          .from("orders")
          .update({ status: newStatus })
          .eq("id", order.id);

        if (updateError) throw updateError;

        // 4. Envoyer une confirmation par WhatsApp
        const responseMsg = cleanBody === "OUI"
          ? `Merci *${order.customer_name}* ! Votre commande *#${order.order_number}* est maintenant *confirmée* et en cours de préparation. ✨`
          : `Votre commande *#${order.order_number}* a bien été *annulée*. À bientôt chez ALIAA Natural Care. 🌿`;

        const ultraMsgUrl = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`;
        const params = new URLSearchParams();
        params.append("token", ULTRAMSG_TOKEN || "");
        params.append("to", from);
        params.append("body", responseMsg);

        await fetch(ultraMsgUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        });

        console.log(`Order ${order.order_number} updated to ${newStatus}`);
      } else {
        console.log(`No pending order found matching suffix ${last9Digits} among ${allPendingOrders?.length || 0} pending orders.`);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // 200 pour que UltraMsg ne réessaie pas indéfiniment
    });
  }
});
