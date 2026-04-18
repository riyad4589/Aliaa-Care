/**
 * Service pour gérer l'envoi de messages WhatsApp via UltraMsg
 * NOTE: All UltraMsg API calls are proxied through the Supabase Edge Function
 *       `send-whatsapp`. The token is NEVER exposed in the client bundle.
 */

import { supabase } from "@/integrations/supabase/client";

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
 * Envoie un message de confirmation de commande avec des boutons interactifs.
 * Delegated to the `send-whatsapp` Supabase Edge Function so the UltraMsg
 * token stays server-side and is never embedded in the client JS bundle.
 */
export const sendOrderWhatsAppNotification = async (
  order: OrderData,
  items: OrderItem[]
) => {
  const { data, error } = await supabase.functions.invoke("send-whatsapp", {
    body: { order, items },
  });

  if (error) {
    console.error("Error sending WhatsApp notification via Edge Function:", error);
    throw error;
  }

  if (data?.sent === "true") {
    console.log("WhatsApp message sent successfully:", data.id);
  } else {
    console.warn("UltraMsg response:", data);
  }

  return data;
};
