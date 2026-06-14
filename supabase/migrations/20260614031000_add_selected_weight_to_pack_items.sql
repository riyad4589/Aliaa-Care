-- Add selected_weight column to pack_items table
ALTER TABLE public.pack_items ADD COLUMN IF NOT EXISTS selected_weight text;
