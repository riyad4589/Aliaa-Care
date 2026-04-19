/**
 * STRESS TEST — Aliaa Care
 * =========================
 * Pousse progressivement jusqu'à 200 utilisateurs pour trouver le point de rupture.
 * Identifie la limite du plan Supabase Free (rate limiting, connexions pool, etc.)
 *
 * ⚠️  Test destructif — peut déclencher des erreurs 429 (Too Many Requests).
 *     Ne lancer qu'en dehors des heures de trafic réel.
 *
 * Lancer : k6 run tests/k6/stress.test.js
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { SUPABASE_URL, HEADERS } from "./config.js";

export const options = {
  stages: [
    { duration: "2m", target: 50  },  // Charge normale
    { duration: "2m", target: 100 },  // Stress
    { duration: "2m", target: 200 },  // Point de rupture
    { duration: "1m", target: 0   },  // Récupération
  ],
  thresholds: {
    // On accepte une dégradation — on cherche juste le point de rupture
    http_req_duration: ["p(99)<5000"],
    http_req_failed:   ["rate<0.10"], // Jusqu'à 10% d'erreurs accepté en stress
  },
};

export default function () {
  // Requête la plus simple pour mesurer la limite brute de Supabase
  const res = http.get(
    `${SUPABASE_URL}/rest/v1/products?select=id,name&active=eq.true&limit=5`,
    { headers: HEADERS }
  );

  check(res, {
    "status 200": (r) => r.status === 200,
    "pas de rate limit (429)": (r) => r.status !== 429,
    "pas d'erreur serveur (5xx)": (r) => r.status < 500,
  });

  // Log les erreurs 429 pour identifier le seuil
  if (res.status === 429) {
    console.warn(`Rate limit atteint à ${__VU} VUs — retry-after: ${res.headers["Retry-After"]}`);
  }

  sleep(0.5);
}
