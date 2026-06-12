/**
 * Service pour gérer l'envoi de messages WhatsApp via WAHA
 */

import { supabase } from "@/integrations/supabase/client";

export interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  selected_flavors?: string[];
  pack_item_flavors?: Record<string, string[]>;
  selected_weight?: number;
}

export interface OrderData {
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

export const sendOrderWhatsAppNotification = async (
  order: OrderData,
  items: OrderItem[],
  language: string = "fr"
) => {
  const t = translations[language as keyof typeof translations] || translations.fr;
  
  const itemsList = items
    .map((item) => {
      const nameWithWeight = item.selected_weight ? `${item.product_name} (${item.selected_weight}g)` : item.product_name;
      let text = `• ${item.quantity}x ${nameWithWeight} (${item.unit_price} DH)`;
      
      if (item.selected_flavors && item.selected_flavors.length > 0) {
        text += `\n  _${t.flavors} ${item.selected_flavors.join(", ")}_`;
      }
      
      if (item.pack_item_flavors && Object.keys(item.pack_item_flavors).length > 0) {
        Object.entries(item.pack_item_flavors).forEach(([pName, flavors]) => {
          if (flavors && flavors.length > 0) {
            text += `\n   - ${pName}: _${flavors.join(", ")}_`;
          }
        });
      }
      
      return text;
    })
    .join("\n");

  const message =
    `${t.title}\n\n` +
    `${t.greeting} ${order.customerName},\n` +
    `${t.thanks} *#${order.order_number}*.\n\n` +
    `${t.details}\n${itemsList}\n\n` +
    `💰 *${t.total} ${order.total.toLocaleString()} DH*\n` +
    `📍 *${t.address}* ${order.address}\n\n` +
    `${t.footer}`;

  const buttons = [
    { id: "oui", text: language === "ar" ? "تأكيد الطلب ✅" : "Confirmer ✅" },
    { id: "non", text: language === "ar" ? "إلغاء الطلب ❌" : "Annuler ❌" }
  ];

  const { data, error } = await supabase.functions.invoke("send-whatsapp", {
    body: { 
      phone: order.phone,
      message: message,
      buttons: buttons
    },
  });

  if (error) throw error;
  return data;
};
