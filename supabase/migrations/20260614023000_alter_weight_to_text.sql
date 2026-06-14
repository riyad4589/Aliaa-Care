-- Alter products.weight to text type
ALTER TABLE products ALTER COLUMN weight TYPE text USING weight::text;

-- Alter order_items.selected_weight to text type
ALTER TABLE order_items ALTER COLUMN selected_weight TYPE text USING selected_weight::text;
