-- Ajouter les colonnes manquantes pour les informations client dans la table orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS customer_city TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Mettre à jour les politiques de sécurité (RLS) pour ces colonnes si nécessaire
-- (Elles sont déjà ouvertes en insertion d'après la migration précédente)
