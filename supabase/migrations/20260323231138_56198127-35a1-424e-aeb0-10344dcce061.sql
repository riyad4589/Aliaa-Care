-- Add original_price to products for strikethrough pricing
ALTER TABLE public.products ADD COLUMN original_price NUMERIC DEFAULT NULL;

-- Promotions system
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'percentage',
  -- percentage, flash, buy_x_get_y, tiered, product_of_day
  discount_percent INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_flash BOOLEAN NOT NULL DEFAULT false,
  -- buy X get Y
  buy_quantity INTEGER DEFAULT NULL,
  get_quantity INTEGER DEFAULT NULL,
  get_product_id UUID DEFAULT NULL,
  -- tiered discounts (JSONB array: [{min_qty, discount_percent}])
  tier_rules JSONB DEFAULT NULL,
  -- targeting
  target_type TEXT NOT NULL DEFAULT 'all',
  -- all, specific_products, specific_categories
  product_ids UUID[] DEFAULT '{}',
  category_ids UUID[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read promotions" ON public.promotions FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert promotions" ON public.promotions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update promotions" ON public.promotions FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete promotions" ON public.promotions FOR DELETE TO public USING (true);