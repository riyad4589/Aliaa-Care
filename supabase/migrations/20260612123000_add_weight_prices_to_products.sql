-- Add weight_prices column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_prices jsonb DEFAULT '[]'::jsonb;

-- Add selected_weight column to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_weight numeric;
