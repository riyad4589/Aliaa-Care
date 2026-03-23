
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL DEFAULT 10,
  applies_to TEXT NOT NULL DEFAULT 'all',
  product_ids UUID[] DEFAULT '{}',
  pack_ids UUID[] DEFAULT '{}',
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read promo_codes" ON public.promo_codes FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert promo_codes" ON public.promo_codes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update promo_codes" ON public.promo_codes FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete promo_codes" ON public.promo_codes FOR DELETE TO public USING (true);
