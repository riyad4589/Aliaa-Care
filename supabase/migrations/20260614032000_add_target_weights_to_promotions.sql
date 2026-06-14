-- Add target_weights column to promotions table
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS target_weights jsonb;
