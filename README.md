🌿 Aliaa-Care - E-commerce de Soins Naturels & Bien-être

<div id="top"></div>

[![Production](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)](https://github.com/riyad4589/Aliaa-Care)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Supabase%20%7C%20Tailwind-blue?style=for-the-badge)](https://github.com/riyad4589/Aliaa-Care)

Aliaa-Care est une plateforme e-commerce haut de gamme dédiée aux rituels de soins naturels traditionnels. Conçue avec une approche "mobile-first" et une esthétique premium, elle offre une expérience d'achat fluide pour les clients et un outil de gestion puissant pour les administrateurs.

---

## 📌 Sommaire

- [🔗 Liens Officiels](#-liens-officiels)
- [✨ Points Forts du Projet](#-points-forts-du-projet)

  - [🛍️ Expérience Client](#-expérience-client-storefront)
  - [🛠️ Gestion Administrative](#-gestion-administrative-admin-dashboard)
- [🛠️ Détails Techniques Approfondis](#-détails-techniques-approfondis)
  - [🗄️ Architecture de la Base de Données](#️-architecture-de-la-base-de-données-supabase)
  - [💬 Intégration WhatsApp](#-intégration-whatsapp-waha--ultramsg)
  - [🌍 Système Internationalisation](#-système-internationalisation-i18n)
- [🚀 Stack Technique](#-stack-technique)
- [📦 Installation et Lancement](#-installation-et-lancement)
- [🌐 Déploiement](#-déploiement)
- [🤝 Contributing](#-contributing)

---

## 🔗 Liens Officiels

| Plateforme | Détails / URL |
| :--- | :--- |
| 🌐 **Site Public** | [https://aliaacare.com/](https://aliaacare.com/) |
| 🔐 **Interface Admin** | [https://admin.aliaacare.com/](https://admin.aliaacare.com/) |
| 👤 **Compte Admin** | `aliaacare@gmail.com` |
| 🔑 **Mot de passe** | `Aliaacare2026!` |

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

### 💻 Frontend & Logic
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=react-hook-form&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

### 🎨 Design & UI
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Shadcn/UI](https://img.shields.io/badge/Shadcn/UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide_Icons-FFB800?style=for-the-badge&logo=lucide&logoColor=black)

### 🗄️ Backend & Infrastructure
![Supabase](https://img.shields.io/badge/Supabase-1C1C1C?style=for-the-badge&logo=supabase&logoColor=3ECF8E)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![PM2](https://img.shields.io/badge/PM2-2B037A?style=for-the-badge&logo=pm2&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)

### 📋 Détail de l'utilisation

| Technologie | Utilisation |
| :--- | :--- |
| **React + Vite** | Framework Frontend ultra-rapide et moderne |
| **TypeScript** | Typage statique pour une robustesse et maintenabilité accrues |
| **Supabase** | Backend-as-a-Service (Auth, PostgreSQL, Storage, Edge Functions) |
| **Tailwind CSS** | Design system utilitaire pour un stylage rapide et responsive |
| **Shadcn/UI** | Bibliothèque de composants UI premium basée sur Radix UI |
| **TanStack Query** | Gestion puissante de l'état asynchrone et du cache serveur |
| **Framer Motion** | Bibliothèque d'animations fluides et interactives |
| **jsPDF** | Moteur de génération dynamique de factures clients en PDF |
| **Recharts** | Visualisation de données pour les statistiques financières admin |
| **WhatsApp API** | Automatisation des notifications de commande via UltraMsg/WAHA |



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

<p align="center">
  <a href="#top">⬆️ Retour en haut</a>
</p>