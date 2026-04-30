# 🌿 Aliaa-Care - E-commerce de Soins Naturels & Bien-être

[![Production](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)](https://github.com/riyad4589/Aliaa-Care)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Supabase%20%7C%20Tailwind-blue?style=for-the-badge)](https://github.com/riyad4589/Aliaa-Care)

Aliaa-Care est une plateforme e-commerce haut de gamme dédiée aux rituels de soins naturels traditionnels. Conçue avec une approche "mobile-first" et une esthétique premium, elle offre une expérience d'achat fluide pour les clients et un outil de gestion puissant pour les administrateurs.

---

## ✨ Points Forts du Projet

### 🛍️ Expérience Client (Storefront)
- **Design de Luxe** : Interface épurée, animations fluides (Framer Motion) et typographie soignée.
- **Multilingue Intégral** : Support dynamique du **Français**, **Anglais** et **Arabe** (avec support RTL).
- **Gestion de Panier Avancée** : Calcul des paliers de livraison gratuite, gestion des stocks en temps réel.
- **Packs Personnalisés** : Système d'offres groupées avec calcul automatique des économies pour le client.
- **Suivi & Fidélité** : Wishlist persistante, suivi de commande intuitif et espace client sécurisé.

### 🛠️ Gestion Administrative (Admin Dashboard)
- **Contrôle Total** : Gestion granulaire des produits, catégories, packs et stocks.
- **Business Intelligence** : Visualisation des performances financières et statistiques de ventes via Recharts.
- **Facturation Automatique** : Génération de factures PDF professionnelles (jsPDF) incluant le détail des produits et taxes.
- **Marketing Dynamique** : Gestion des codes promos et bannières d'annonces modifiables en temps réel.

---

## 🛠️ Détails Techniques Approfondis

### 🗄️ Architecture de la Base de Données (Supabase)
Le projet utilise une base de données PostgreSQL structurée pour l'évolutivité :
- **`products` & `categories`** : Gestion des produits avec support multi-images et slugs uniques.
- **`orders` & `order_items`** : Stockage des transactions avec historique des statuts.
- **`packs`** : Table dédiée aux offres groupées reliant plusieurs produits.
- **`promo_codes`** : Système de réduction avec dates d'expiration et limites d'utilisation.
- **RLS (Row Level Security)** : Politiques de sécurité strictes isolant les données publiques des données administratives.

### 💬 Intégration WhatsApp (WAHA / UltraMsg)
Le système de notification est automatisé via un service dédié (`src/lib/whatsapp.ts`) :
- **Notifications de Commande** : Envoi automatique d'un récapitulatif structuré au client après validation.
- **Templates Multilingues** : Messages adaptés selon la langue choisie par le client (FR/EN/AR).
- **Boutons Interactifs** : Possibilité d'inclure des boutons de confirmation/annulation directement dans WhatsApp.

### 🌍 Système Internationalisation (i18n)
Contrairement aux bibliothèques lourdes, Aliaa-Care utilise un système i18n léger et performant basé sur un dictionnaire centralisé (`src/i18n/translations.ts`) :
- **Support RTL** : Inversion automatique de l'interface pour la langue Arabe.
- **Détection Automatique** : Mémorisation de la préférence linguistique du visiteur.

---

## 🚀 Stack Technique

| Technologie | Utilisation |
| :--- | :--- |
| **React + Vite** | Framework Frontend ultra-rapide |
| **TypeScript** | Typage statique pour une robustesse maximale |
| **Supabase** | Backend (Auth, Database, Storage pour les photos produits) |
| **Tailwind CSS** | Design system utilitaire et responsive |
| **TanStack Query** | Gestion d'état serveur et cache |
| **jsPDF** | Moteur de génération de factures clients |

---

## 📦 Installation et Lancement

1. **Clonage et Dépendances**
   ```bash
   git clone https://github.com/riyad4589/Aliaa-Care.git
   cd Aliaa-Care
   npm install
   ```

2. **Configuration**
   Remplissez le fichier `.env` avec vos clés Supabase et vos identifiants WhatsApp (Instance ID & Token).

3. **Lancement**
   ```bash
   npm run dev
   ```

---

## 🌐 Déploiement

Le projet est prêt pour un déploiement sur **VPS** (Ubuntu/Debian) :
- **Serveur Web** : Nginx configuré comme reverse-proxy.
- **Gestionnaire de Processus** : PM2 pour garantir la disponibilité 24/7.
- **CI/CD** : Déploiement automatisé via GitHub Actions recommandé.

---

## 🤝 Contributing

<p align="center">
<table align="center">
<tr>
<td align="center" width="300">
<a href="https://github.com/riyad4589">
<img src="https://github.com/riyad4589.png" width="150px;" style="border-radius: 50%;" alt="Mohamed Riyad MAJGHIROU"/><br /><br />
<b style="font-size: 18px;">Mohamed Riyad MAJGHIROU</b>
</a><br /><br />
<a href="mailto:riyadmaj10@gmail.com">📧 Email</a> •
<a href="https://www.linkedin.com/in/mohamed-riyad-majghirou-5b62aa388/">💼 LinkedIn</a> •
<a href="https://www.riyadmaj.com/">🌐 Portfolio</a>
</td>
<td align="center" width="300">
<a href="https://github.com/Azzammoo10">
<img src="https://github.com/Azzammoo10.png" width="150px;" style="border-radius: 50%;" alt="Mohamed AZZAM"/><br /><br />
<b style="font-size: 18px;">Mohamed AZZAM</b>
</a><br /><br />
<a href="mailto:azzam.moo10@gmail.com">📧 Email</a> •
<a href="https://www.linkedin.com/in/mohamed-azzam-93115823a/">💼 LinkedIn</a> •
<a href="https://azzammo.com">🌐 Portfolio</a>
</td>
</tr>
</table>
</p>

---

Développé pour offrir le meilleur du naturel à travers le meilleur de la technologie. 🌿 **Aliaa-Care**