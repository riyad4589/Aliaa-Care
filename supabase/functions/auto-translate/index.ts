import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { record, table } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!record || !table) {
      throw new Error("Missing record or table information");
    }

    console.log(`[Auto-Translate] Processing ${table} ID: ${record.id}`);

    // Définir les champs à traduire selon la table
    const fieldsToTranslate: string[] = [];
    if (table === "products" || table === "packs") {
      fieldsToTranslate.push("name", "description", "long_description");
    } else if (table === "categories") {
      fieldsToTranslate.push("name", "description");
    }

    const updates: any = {};
    const sourceLang = "French";
    const targetLangs = [
      { code: "en", name: "English" },
      { code: "ar", name: "Arabic" },
    ];

    for (const field of fieldsToTranslate) {
      const sourceText = record[field];
      if (!sourceText || sourceText.trim() === "") continue;

      for (const target of targetLangs) {
        // On ne traduit que si la colonne de destination est vide
        const targetColumn = `${field}_${target.code}`;
        if (!record[targetColumn]) {
          console.log(`[Auto-Translate] Translating ${field} to ${target.name}...`);
          
          const translatedText = await translateWithGemini(
            sourceText,
            sourceLang,
            target.name,
            GEMINI_API_KEY
          );

          if (translatedText) {
            updates[targetColumn] = translatedText;
          }
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      console.log(`[Auto-Translate] Updating ${table} with:`, Object.keys(updates));
      const { error } = await supabaseClient
        .from(table)
        .update(updates)
        .eq("id", record.id);

      if (error) throw error;
    }

    return new Response(JSON.stringify({ success: true, updates }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[Auto-Translate] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function translateWithGemini(text: string, from: string, to: string, apiKey: string | undefined) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const prompt = `You are a professional translator for a natural wellness and cosmetics brand called "Aliaa Natural Care". 
Translate the following text from ${from} to ${to}. 
Maintain a premium, elegant, and natural tone. 
If translating to Arabic, use Modern Standard Arabic (Fusha) that is clear and appealing for a Moroccan and Middle Eastern audience.
Only return the translated text, nothing else.

Text to translate:
${text}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1, // Bas pour plus de précision
          },
        }),
      }
    );

    const data = await response.json();
    const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return translated || null;
  } catch (err) {
    console.error("Gemini API Error:", err);
    return null;
  }
}
