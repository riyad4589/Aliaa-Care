-- Add translation columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_ar TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS long_description_ar TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS long_description_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS materials_ar TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS materials_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS flavors_ar TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS flavors_en TEXT[];

-- Add translation columns to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_ar TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Add translation columns to packs table
ALTER TABLE packs ADD COLUMN IF NOT EXISTS name_ar TEXT;
ALTER TABLE packs ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE packs ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE packs ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE packs ADD COLUMN IF NOT EXISTS long_description_ar TEXT;
ALTER TABLE packs ADD COLUMN IF NOT EXISTS long_description_en TEXT;
