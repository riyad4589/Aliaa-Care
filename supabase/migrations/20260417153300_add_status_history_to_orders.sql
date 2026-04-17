ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb;
