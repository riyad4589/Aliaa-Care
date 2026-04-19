/**
 * k6 Load Test Suite — ALIAA Natural Care
 * =========================================
 * Couvre 4 scénarios : smoke, load, stress, checkout flow
 *
 * Installation k6 : https://k6.io/docs/getting-started/installation/
 * Lancer un test  : k6 run tests/k6/smoke.test.js
 */

// ─── CONFIG GLOBALE ──────────────────────────────────────────────────────────
export const SUPABASE_URL = "https://ryaqtleyitxoyrxtcypu.supabase.co";
export const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YXF0bGV5aXR4b3lyeHRjeXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMjI1NDcsImV4cCI6MjA4OTU5ODU0N30.oy9-v82UsyErG3XlEhuGYkc75s9rSEmcE9--Yb3tOrI";

export const HEADERS = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

// Seuils de performance acceptables
export const THRESHOLDS = {
  // 95% des requêtes < 800ms
  http_req_duration: ["p(95)<800", "p(99)<2000"],
  // Moins de 1% d'erreurs
  http_req_failed: ["rate<0.01"],
};
