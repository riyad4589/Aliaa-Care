import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WAHA_URL = Deno.env.get("WAHA_URL");
const WAHA_API_KEY = Deno.env.get("WAHA_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, message, buttons } = await req.json();

    if (!phone || !message) {
      throw new Error("Missing phone or message");
    }

    // Format phone
    let cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.startsWith("0")) cleanedPhone = "212" + cleanedPhone.substring(1);
    if (cleanedPhone.length === 9) cleanedPhone = "212" + cleanedPhone;

    const hasButtons = buttons && Array.isArray(buttons) && buttons.length > 0;
    const endpoint = hasButtons ? "sendButtons" : "sendText";
    
    const payload: any = {
      chatId: `${cleanedPhone}@c.us`,
      session: "default"
    };

    if (hasButtons) {
      payload.text = message;
      payload.buttons = buttons;
    } else {
      payload.text = message;
    }

    console.log(`Sending WhatsApp via WAHA endpoint: ${endpoint}`);

    const response = await fetch(`${WAHA_URL}/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": WAHA_API_KEY },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("WAHA Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
