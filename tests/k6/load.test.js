/**
 * LOAD TEST — Aliaa Care
 * =======================
 * Simule du trafic réaliste : montée progressive jusqu'à 50 utilisateurs.
 * Teste les endpoints public les plus sollicités (catalogue, produits, packs).
 *
 * Lancer : k6 run tests/k6/load.test.js
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { SUPABASE_URL, HEADERS, THRESHOLDS } from "./config.js";

export const options = {
  // Profil de charge réaliste
  stages: [
    { duration: "1m", target: 10 },  // Montée douce → 10 users
    { duration: "3m", target: 50 },  // Charge nominale → 50 users
    { duration: "1m", target: 0 },   // Descente
  ],
  thresholds: {
    ...THRESHOLDS,
    // Supabase Free : on surveille que le rate limit ne bloque pas
    "http_req_failed{endpoint:products}": ["rate<0.02"],
    "http_req_failed{endpoint:categories}": ["rate<0.02"],
  },
};

export default function () {
  const vuId = __VU; // Numéro de l'utilisateur virtuel

  // Chaque VU simule un parcours client différent
  const scenario = vuId % 3;

  if (scenario === 0) {
    // Parcours A : Visiteur catalogue
    browseProducts();
  } else if (scenario === 1) {
    // Parcours B : Visiteur packs
    browsePacks();
  } else {
    // Parcours C : Visiteur mixte
    browseProducts();
    sleep(2);
    browsePacks();
  }

  sleep(Math.random() * 3 + 1); // Think time : 1-4 secondes
}

function browseProducts() {
  // 1. Liste des produits
  const list = http.get(
    `${SUPABASE_URL}/rest/v1/products?select=id,name,price,active&active=eq.true&limit=20`,
    { headers: HEADERS, tags: { endpoint: "products" } }
  );
  check(list, {
    "products list: 200": (r) => r.status === 200,
    "products list: body non vide": (r) => r.body.length > 2,
  });

  sleep(1);

  // 2. Détail d'un produit (simule le clic sur le premier résultat)
  const products = JSON.parse(list.body);
  if (products.length > 0) {
    const productId = products[0].id;
    const detail = http.get(
      `${SUPABASE_URL}/rest/v1/products?id=eq.${productId}&select=*,product_images(*),product_categories(category_id,categories(name))`,
      { headers: HEADERS, tags: { endpoint: "product_detail" } }
    );
    check(detail, {
      "product detail: 200": (r) => r.status === 200,
    });
  }
}

function browsePacks() {
  const packs = http.get(
    `${SUPABASE_URL}/rest/v1/packs?select=*,pack_items(*)&active=eq.true`,
    { headers: HEADERS, tags: { endpoint: "packs" } }
  );
  check(packs, {
    "packs: 200": (r) => r.status === 200,
  });
}
