# 🌿 Aliaa-Care - E-commerce de Soins Naturels & Bien-être

[![Production](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)](https://github.com/riyad4589/Aliaa-Care)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Supabase%20%7C%20Tailwind-blue?style=for-the-badge)](https://github.com/riyad4589/Aliaa-Care)

Aliaa-Care est une plateforme e-commerce haut de gamme dédiée aux rituels de soins naturels traditionnels. Conçue avec une approche "mobile-first" et une esthétique premium, elle offre une expérience d'achat fluide pour les clients et un outil de gestion puissant pour les administrateurs.

---

## ✨ Points Forts du Projet

### 🛍️ Expérience Client (Storefront)
- **Design de Luxe** : Interface épurée, animations fluides (Framer Motion) et typographie soignée.
- **Multilingue Intégral** : Support dynamique du **Français**, **Anglais** et **Arabe**.
- **Gestion de Panier Avancée** : Calcul des paliers de livraison gratuite, gestion des stocks en temps réel.
- **Packs Personnalisés** : Système d'offres groupées avec calcul automatique des économies pour le client.
- **Suivi & Fidélité** : Wishlist persistante, suivi de commande intuitif et espace client sécurisé.

### 🛠️ Gestion Administrative (Admin Dashboard)
- **Contrôle Total** : Gestion granulaire des produits, catégories, packs et stocks.
- **Automatisation WhatsApp** : Intégration **UltraMsg** pour l'envoi automatique de confirmations et suivis directement par message.
- **Business Intelligence** : Visualisation des performances financières et statistiques de ventes via Recharts.
- **Facturation Automatique** : Génération de factures PDF professionnelles (jsPDF).
- **Gestion Logistique** : Suivi des statuts de commande et optimisation du packaging.

---

## 🚀 Stack Technique

| Technologie | Utilisation |
| :--- | :--- |
| **React + Vite** | Framework Frontend ultra-rapide |
| **TypeScript** | Typage statique pour une robustesse maximale |
| **Supabase** | Backend-as-a-Service (Auth, Database, Storage) |
| **Tailwind CSS** | Design system utilitaire et responsive |
| **Shadcn/UI** | Bibliothèque de composants UI premium |
| **TanStack Query** | Gestion d'état serveur et cache |
| **UltraMsg API** | Intégration de la passerelle WhatsApp |

---

## 📦 Installation en Local

1. **Cloner le projet**
   ```bash
   git clone https://github.com/riyad4589/Aliaa-Care.git
   cd Aliaa-Care
   ```

2. **Installer les dépendances**
   ```bash
   npm install # ou bun install
   ```

3. **Configuration de l'environnement**
   Créez un fichier `.env` à la racine :
   ```env
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anon
   VITE_ULTRAMSG_INSTANCE_ID=votre_id_instance
   VITE_ULTRAMSG_TOKEN=votre_token
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

---

## 🌐 Déploiement en Production

Le projet est configuré pour un déploiement professionnel sur VPS (OVH/Contabo) :

### Via Docker (Recommandé)
Le projet peut être conteneurisé avec les configurations Supabase self-hosted :
```bash
docker-compose up -d
```

### Via PM2 & Vite
Pour un déploiement standard sous Linux :
```bash
npm run build
pm2 start npm --name "aliaa-care" -- run preview -- --port 3000 --host
```

---

## 🏗️ Architecture du Projet

```text
src/
├── components/     # Composants UI réutilisables (shadcn, custom)
├── context/        # Contextes React (Auth, Panier, etc.)
├── hooks/          # Hooks personnalisés (API, Logique métier)
├── i18n/           # Système de traduction multilingue
├── integrations/   # Clients API (Supabase, WhatsApp)
├── pages/          # Vues principales (E-shop & Administration)
└── utils/          # Formateurs, calculs et constantes
```

---

## 🤝 Contribution et Maintenance

- **Linting** : `npm run lint`
- **Tests** : `npm run test`
- **Optimisation Images** : `npm run optimize` (script personnalisé pour le web)

Développé avec passion pour **Aliaa Natural Care**. 🌿 
"Pure Plants, True Relief."