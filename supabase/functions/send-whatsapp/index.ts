import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  selected_flavors?: string[];
}

interface OrderData {
  order_number: string;
  total: number;
  customerName: string;
  phone: string;
  address: string;
}

const translations = {
  fr: {
    title: "*Nouvelle commande chez ALIAA Natural Care* 🌿",
    greeting: "Bonjour",
    thanks: "Merci pour votre commande",
    details: "*Détails :*",
    total: "Total :",
    address: "Adresse :",
    footer: "Votre commande est en cours de traitement. Nous vous contacterons bientôt pour la livraison.",
    flavors: "Goûts :",
  },
  ar: {
    title: "*طلب جديد من ALIAA Natural Care* 🌿",
    greeting: "مرحباً",
    thanks: "شكراً لطلبك",
    details: "*التفاصيل:*",
    total: "المجموع:",
    address: "العنوان:",
    footer: "طلبك قيد المعالجة. سنتصل بك قريباً بخصوص التوصيل.",
    flavors: "النكهات:",
  },
  en: {
    title: "*New order at ALIAA Natural Care* 🌿",
    greeting: "Hello",
    thanks: "Thank you for your order",
    details: "*Details:*",
    total: "Total:",
    address: "Address:",
    footer: "Your order is being processed. We will contact you soon for delivery.",
    flavors: "Flavors:",
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { order, items, language = "fr" } = await req.json();
    const t = translations[language] || translations.fr;

    // Format phone
    let cleanedPhone = order.phone.replace(/\D/g, "");
    if (cleanedPhone.startsWith("0")) cleanedPhone = "212" + cleanedPhone.substring(1);
    if (cleanedPhone.length === 9) cleanedPhone = "212" + cleanedPhone;

    const itemsList = items
      .map((item) => {
        let text = `• ${item.quantity}x ${item.product_name} (${item.unit_price} DH)`;
        if (item.selected_flavors && item.selected_flavors.length > 0) {
          text += `\n  _${t.flavors} ${item.selected_flavors.join(", ")}_`;
        }
        return text;
      })
      .join("\n");

    const body =
      `${t.title}\n\n` +
      `${t.greeting} ${order.customerName},\n` +
      `${t.thanks} *#${order.order_number}*.\n\n` +
      `${t.details}\n${itemsList}\n\n` +
      `💰 *${t.total} ${order.total.toLocaleString()} DH*\n` +
      `📍 *${t.address}* ${order.address}\n\n` +
      `${t.footer}`;

    const response = await fetch(`${WAHA_URL}/api/sendText`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": WAHA_API_KEY },
      body: JSON.stringify({
        chatId: `${cleanedPhone}@c.us`,
        text: body,
        session: "default"
      }),
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
