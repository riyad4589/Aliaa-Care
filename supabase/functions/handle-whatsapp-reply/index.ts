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

  try {
    const payload = await req.json();
    console.log("UltraMsg Webhook received:", payload);

    // UltraMsg envoie souvent les données dans payload.data
    // format: { event_type: "message_received", data: { from: "...", body: "...", ... } }
    const data = payload.data || payload;
    const body = (data.body || "").trim().toUpperCase();
    const from = data.from || ""; // Format: 212600000000@c.us
    
    // Extraire le numéro de téléphone sans le @c.us
    let phone = from.split("@")[0]; 

    // Pour correspondre au stockage (souvent 06... ou 2126...), on normalise
    // On va chercher les commandes qui finissent par ce numéro
    const last9Digits = phone.slice(-9);

    if (body === "OUI" || body === "NON" || body === "OUI." || body === "NON.") {
      const cleanBody = body.replace(".", "");
      
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // 1. Trouver la dernière commande en attente pour ce numéro
      // On utilise ilike avec % pour être flexible sur le format (06 ou 2126)
      const { data: orders, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .ilike("customer_phone", `%${last9Digits}`)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);

      if (orderError) throw orderError;

      if (orders && orders.length > 0) {
        const order = orders[0];
        const newStatus = cleanBody === "OUI" ? "confirmed" : "cancelled";

        // 2. Mettre à jour le statut
        const { error: updateError } = await supabase
          .from("orders")
          .update({ status: newStatus })
          .eq("id", order.id);

        if (updateError) throw updateError;

        // 3. Envoyer une confirmation par WhatsApp
        const responseMsg = cleanBody === "OUI" 
          ? `Merci ${order.customer_name} ! Votre commande *#${order.order_number}* est maintenant *confirmée* et en cours de préparation. ✨`
          : `Votre commande *#${order.order_number}* a bien été *annulée*. À bientôt chez ALIAA Natural Care. 🌿`;

        const ultraMsgUrl = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`;
        const params = new URLSearchParams();
        params.append("token", ULTRAMSG_TOKEN || "");
        params.append("to", from);
        params.append("body", responseMsg);
        
        await fetch(ultraMsgUrl, { 
          method: "POST", 
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString() 
        });
        
        console.log(`Order ${order.order_number} updated to ${newStatus}`);
      } else {
        console.log("No pending order found for phone:", phone);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // On retourne 200 pour que UltraMsg ne réessaie pas indéfiniment en cas d'erreur de logique
    });
  }
});
