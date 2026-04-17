-- Ajouter la colonne status à la table orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
