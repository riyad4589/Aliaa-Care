# 🌿 Aliaa-Care - Plateforme E-commerce Premium de Soins Naturels

Aliaa-Care est une application e-commerce moderne et sophistiquée dédiée au bien-être féminin et aux soins naturels traditionnels. Inspirée par le savoir ancestral et adaptée aux besoins contemporains, la plateforme offre une expérience utilisateur luxueuse et fluide, optimisée pour le marché marocain et international.

## ✨ Fonctionnalités Clés

### 🛍️ Expérience Client Premium
- **Catalogue Multilingue** : Support complet du **Français**, **Anglais** et **Arabe**.
- **Produits Traditionnels** : Mise en avant de rituels naturels (Chay Nifas, Msakhen, Tashinas, Talbina).
- **Système de Packs** : Offres groupées intelligentes avec calcul automatique des économies.
- **Panier Avancé** : Gestion des remises par paliers et indicateurs de livraison gratuite (dès 500 DH).
- **Processus de Checkout** : Formulaire optimisé avec validation en temps réel et notes personnalisées.
- **Suivi de Commande** : Interface intuitive pour suivre l'acheminement des colis.
- **Liste de Souhaits (Wishlist)** : Sauvegarde des produits favoris avec persistance.

### 🛠️ Administration & Logistique (Back-office)
- **Tableau de Bord Holistique** : Vue d'ensemble des ventes, commandes et performances financières.
- **Gestion Inventaire** : Contrôle total sur les produits, catégories et stocks.
- **Automatisation WhatsApp (UltraMsg)** : Envoi automatique de confirmations de commande et notifications de suivi directement sur le téléphone du client.
- **Module Finances** : Analyse détaillée des revenus avec visualisations graphiques (Recharts).
- **Gestion du Packaging** : Suivi spécifique des besoins en emballage et logistique d'expédition.
- **Marketing Dynamique** : Création et gestion de codes promotionnels et campagnes de réductions.

## 🚀 Stack Technique

### Core & Framework
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-1C1C1C?style=for-the-badge&logo=supabase&logoColor=3ECF8E)

### UI & Styling
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
- **Composants** : Radix UI, Lucide React, Embla Carousel, Vaul (Drawers).
- **Visualisation** : Recharts pour les graphiques financiers.

### State & Logic
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)
- **Formulaires** : React Hook Form + Zod (Validation).
- **Navigation** : React Router DOM v6.

### Utilitaires & Intégrations
- **WhatsApp** : Intégration API UltraMsg.
- **Documents** : jsPDF & jsPDF-AutoTable pour la facturation.
- **Internationalisation** : Système i18n personnalisé (FR, EN, AR).
- **Thèmes** : Next Themes (Support mode sombre/clair).

## 📦 Installation et Configuration


### 1. Prérequis
- Node.js (v18+) ou Bun
- Un projet Supabase actif
- Une instance UltraMsg configurée

### 2. Clonage et Installation
```bash
git clone <url-du-depot>
cd Aliaa-Care
npm install # ou bun install
```

### 3. Variables d'Environnement
Créez un fichier `.env` à la racine :
```env
# Supabase
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# WhatsApp (UltraMsg)
VITE_ULTRAMSG_INSTANCE_ID=votre_instance_id
VITE_ULTRAMSG_TOKEN=votre_token
```

### 4. Lancement
```bash
npm run dev
```

## 🏗️ Architecture du Code

```text
src/
├── components/     # Composants atomiques et molécules UI
├── pages/          # Vues principales (Client & Admin)
├── hooks/          # Logique métier réutilisable et hooks personnalisés
├── i18n/           # Système de traduction (FR, EN, AR)
├── integrations/   # Clients API (Supabase, UltraMsg)
├── lib/            # Configuration des bibliothèques tiers
├── data/           # Constantes et données de configuration
└── utils/          # Fonctions d'aide (formatage, calculs)
```

## 🛠️ Maintenance et Développement

- **Qualité du code** : `npm run lint` pour l'analyse statique.
- **Tests** : `npm run test` pour lancer la suite Vitest.
- **Build de Production** : `npm run build` pour générer les fichiers optimisés dans `/dist`.

---
Développé pour offrir le meilleur du naturel à travers le meilleur de la technologie. 🌿 **Aliaa-Care**