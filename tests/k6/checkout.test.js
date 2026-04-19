/**
 * CHECKOUT FLOW TEST — Aliaa Care
 * ================================
 * Simule le tunnel de commande complet :
 *   1. Chargement du catalogue
 *   2. Sélection d'un produit
 *   3. Création d'une commande (INSERT orders + order_items)
 *   4. Vérification que la commande est bien enregistrée
 *
 * ⚠️  Ce test INSERT de vraies données en base.
 *     Lancer uniquement sur un environnement de TEST, pas en production.
 *
 * Lancer : k6 run tests/k6/checkout.test.js
 */
import http from "k6/http";
import { check, sleep, group } from "k6";
import { SUPABASE_URL, HEADERS } from "./config.js";

export const options = {
  stages: [
    { duration: "30s", target: 5 },  // 5 commandes simultanées
    { duration: "1m",  target: 5 },  // Maintien
    { duration: "20s", target: 0 },  // Arrêt
  ],
  thresholds: {
    "http_req_duration{step:fetch_products}": ["p(95)<600"],
    "http_req_duration{step:create_order}":   ["p(95)<1200"],
    "http_req_failed":                        ["rate<0.01"],
  },
};

// Données de test — numéros fictifs marocains
const TEST_CUSTOMERS = [
  { name: "Test Client 1", phone: "0600000001", address: "10 Rue Test, Casablanca", city: "Casablanca" },
  { name: "Test Client 2", phone: "0600000002", address: "20 Rue Test, Rabat",      city: "Rabat"       },
  { name: "Test Client 3", phone: "0600000003", address: "30 Rue Test, Marrakech",  city: "Marrakech"   },
  { name: "Test Client 4", phone: "0600000004", address: "40 Rue Test, Fes",        city: "Fes"         },
  { name: "Test Client 5", phone: "0600000005", address: "50 Rue Test, Tanger",     city: "Tanger"      },
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateOrderNumber() {
  return `TEST-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
}

export default function () {
  const customer = randomItem(TEST_CUSTOMERS);

  // ── ÉTAPE 1 : Chargement du catalogue ──────────────────────────────────────
  let productId, productPrice, productName;

  group("1. Catalogue", () => {
    const res = http.get(
      `${SUPABASE_URL}/rest/v1/products?select=id,name,price&active=eq.true&limit=10`,
      { headers: HEADERS, tags: { step: "fetch_products" } }
    );

    check(res, {
      "catalogue: status 200": (r) => r.status === 200,
      "catalogue: produits disponibles": (r) => JSON.parse(r.body).length > 0,
    });

    const products = JSON.parse(res.body);
    if (products.length > 0) {
      const product = randomItem(products);
      productId    = product.id;
      productPrice = product.price;
      productName  = product.name;
    }
  });

  if (!productId) return; // Pas de produits → on arrête ce VU

  sleep(1); // Pense-bête : temps de lecture

  // ── ÉTAPE 2 : Création de la commande ─────────────────────────────────────
  let orderId;

  group("2. Commande", () => {
    const qty = Math.floor(Math.random() * 3) + 1;
    const total = productPrice * qty;

    const orderPayload = JSON.stringify({
      order_number:     generateOrderNumber(),
      customer_name:    customer.name,
      customer_phone:   customer.phone,
      customer_address: customer.address,
      customer_city:    customer.city,
      total:            total,
      status:           "pending",
    });

    const orderRes = http.post(
      `${SUPABASE_URL}/rest/v1/orders`,
      orderPayload,
      { headers: HEADERS, tags: { step: "create_order" } }
    );

    check(orderRes, {
      "order: status 201": (r) => r.status === 201,
      "order: id retourné": (r) => {
        const body = JSON.parse(r.body);
        return body.length > 0 && body[0].id;
      },
    });

    const orderBody = JSON.parse(orderRes.body);
    if (orderBody.length > 0) {
      orderId = orderBody[0].id;

      // ── ÉTAPE 3 : Insertion des articles ──────────────────────────────────
      const itemsPayload = JSON.stringify([{
        order_id:     orderId,
        product_id:   productId,
        product_name: productName,
        quantity:     qty,
        unit_price:   productPrice,
      }]);

      const itemsRes = http.post(
        `${SUPABASE_URL}/rest/v1/order_items`,
        itemsPayload,
        { headers: HEADERS, tags: { step: "create_order_items" } }
      );

      check(itemsRes, {
        "order_items: status 201": (r) => r.status === 201,
      });
    }
  });

  sleep(1);

  // ── ÉTAPE 4 : Vérification de la commande ─────────────────────────────────
  if (orderId) {
    group("3. Vérification", () => {
      const verifyRes = http.get(
        `${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=id,order_number,status`,
        { headers: HEADERS, tags: { step: "verify_order" } }
      );

      check(verifyRes, {
        "verify: status 200": (r) => r.status === 200,
        "verify: commande trouvée": (r) => JSON.parse(r.body).length === 1,
        "verify: statut pending": (r) => {
          const body = JSON.parse(r.body);
          return body.length > 0 && body[0].status === "pending";
        },
      });
    });
  }

  sleep(2);
}
