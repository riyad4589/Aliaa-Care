/**
 * Service pour gérer l'envoi de messages WhatsApp via UltraMsg
 */

const INSTANCE_ID = import.meta.env.VITE_ULTRAMSG_INSTANCE_ID;
const TOKEN = import.meta.env.VITE_ULTRAMSG_TOKEN;
const API_URL = `https://api.ultramsg.com/${INSTANCE_ID}/messages/buttons`;

export interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface OrderData {
  order_number: string;
  total: number;
  customerName: string;
  phone: string;
  address: string;
}

/**
 * Formate le numéro de téléphone pour le format international requis par UltraMsg (ex: 2126...)
 */
export const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, "");
  // Si le numéro commence par 0, on le remplace par l'indicatif 212
  if (cleaned.startsWith("0")) {
    cleaned = "212" + cleaned.substring(1);
  }
  // Si le numéro ne contient pas l'indicatif, on l'ajoute par défaut pour le Maroc
  if (cleaned.length === 9) {
    cleaned = "212" + cleaned;
  }
  return cleaned;
};

/**
 * Envoie un message de confirmation de commande avec des boutons interactifs
 */
export const sendOrderWhatsAppNotification = async (
  order: OrderData,
  items: OrderItem[]
) => {
  if (!INSTANCE_ID || !TOKEN) {
    console.error("UltraMsg credentials missing");
    return;
  }

  const itemsList = items
    .map((item) => `• ${item.quantity}x ${item.product_name} (${item.unit_price} DH)`)
    .join("\n");

  const body = `*Nouvelle commande chez ALIAA Natural Care* 🌿\n\n` +
    `Bonjour ${order.customerName},\n` +
    `Merci pour votre commande *#${order.order_number}*.\n\n` +
    `*Détails :*\n${itemsList}\n\n` +
    `💰 *Total : ${order.total.toLocaleString()} DH*\n` +
    `📍 *Adresse :* ${order.address}\n\n` +
    `Veuillez confirmer la validité de cette commande :`;

  // Construction des paramètres pour l'API UltraMsg (format x-www-form-urlencoded)
  const params = new URLSearchParams();
  params.append("token", TOKEN);
  params.append("to", formatPhoneNumber(order.phone));
  params.append("body", body);
  params.append("footer", "ALIAA Natural Care - Qualité & Nature");
  
  // Format des boutons pour UltraMsg (JSON stringifié)
  const buttons = [
    {
      "buttonId": "confirm_order",
      "buttonText": { "displayText": "✅ Valider la commande" },
      "type": 1
    },
    {
      "buttonId": "cancel_order",
      "buttonText": { "displayText": "❌ Rejeter la commande" },
      "type": 1
    }
  ];
  params.append("buttons", JSON.stringify(buttons));

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const result = await response.json();
    if (result.sent === "true") {
      console.log("WhatsApp message sent successfully:", result.id);
    } else {
      console.warn("UltraMsg response:", result);
    }
    return result;
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    throw error;
  }
};
