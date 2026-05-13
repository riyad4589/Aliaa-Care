-- Add pack_ids to promotions table
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS pack_ids UUID[] DEFAULT '{}';

-- Update types if needed
-- Note: You should run 'supabase gen types typescript --local > src/integrations/supabase/types.ts' 
-- or equivalent to update the frontend types after running this SQL.
