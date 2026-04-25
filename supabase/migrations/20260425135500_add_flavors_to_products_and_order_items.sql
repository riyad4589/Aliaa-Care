ALTER TABLE products ADD COLUMN flavors text[] DEFAULT '{}';
ALTER TABLE order_items ADD COLUMN selected_flavors text[] DEFAULT '{}';
