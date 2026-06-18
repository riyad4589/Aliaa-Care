-- Add free_shipping_threshold column to banner_settings table
ALTER TABLE banner_settings ADD COLUMN IF NOT EXISTS free_shipping_threshold NUMERIC DEFAULT 500;
