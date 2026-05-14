-- Ensure banner_settings table exists
CREATE TABLE IF NOT EXISTS banner_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enabled BOOLEAN DEFAULT TRUE,
    message TEXT DEFAULT 'Livraison partout au Maroc 🚚',
    scrolling_enabled BOOLEAN DEFAULT FALSE,
    text_color TEXT DEFAULT '#FFFFFF',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if they don't exist (in case the table already existed)
ALTER TABLE banner_settings ADD COLUMN IF NOT EXISTS scrolling_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE banner_settings ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#FFFFFF';

-- Insert default row if empty
INSERT INTO banner_settings (enabled, message, scrolling_enabled, text_color)
SELECT TRUE, 'Livraison partout au Maroc 🚚', FALSE, '#FFFFFF'
WHERE NOT EXISTS (SELECT 1 FROM banner_settings);

-- RLS Policies
ALTER TABLE banner_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on banner_settings" 
ON banner_settings FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow admin to update banner_settings" 
ON banner_settings FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
