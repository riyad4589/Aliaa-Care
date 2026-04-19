/**
 * SMOKE TEST — Aliaa Care
 * ========================
 * Vérifie que tout fonctionne avec 1 seul utilisateur.
 * À lancer avant chaque déploiement.
 *
 * Lancer : k6 run tests/k6/smoke.test.js
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { SUPABASE_URL, HEADERS, THRESHOLDS } from "./config.js";

export const options = {
  vus: 1,
  duration: "30s",
  thresholds: THRESHOLDS,
};

export default function () {
  // ── 1. Page produits (catalogue public) ────────────────────────────────────
  const products = http.get(
    `${SUPABASE_URL}/rest/v1/products?select=id,name,price,active&active=eq.true&limit=20`,
    { headers: HEADERS }
  );
  check(products, {
    "products: status 200": (r) => r.status === 200,
    "products: liste non vide": (r) => JSON.parse(r.body).length > 0,
    "products: < 500ms": (r) => r.timings.duration < 500,
  });
  sleep(1);

  // ── 2. Catégories ──────────────────────────────────────────────────────────
  const categories = http.get(
    `${SUPABASE_URL}/rest/v1/categories?select=id,name&limit=20`,
    { headers: HEADERS }
  );
  check(categories, {
    "categories: status 200": (r) => r.status === 200,
    "categories: < 500ms": (r) => r.timings.duration < 500,
  });
  sleep(1);

  // ── 3. Packs ───────────────────────────────────────────────────────────────
  const packs = http.get(
    `${SUPABASE_URL}/rest/v1/packs?select=id,name,price,active&active=eq.true`,
    { headers: HEADERS }
  );
  check(packs, {
    "packs: status 200": (r) => r.status === 200,
    "packs: < 500ms": (r) => r.timings.duration < 500,
  });
  sleep(1);

  // ── 4. Bannière ────────────────────────────────────────────────────────────
  const banner = http.get(
    `${SUPABASE_URL}/rest/v1/banner_settings?select=enabled,message&limit=1`,
    { headers: HEADERS }
  );
  check(banner, {
    "banner: status 200": (r) => r.status === 200,
    "banner: < 300ms": (r) => r.timings.duration < 300,
  });
  sleep(1);
}
