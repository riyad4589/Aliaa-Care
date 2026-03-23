
CREATE TABLE public.packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  long_description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  image text DEFAULT '/placeholder.svg',
  active boolean NOT NULL DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.pack_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  UNIQUE(pack_id, product_id)
);

ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read packs" ON public.packs FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert packs" ON public.packs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update packs" ON public.packs FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete packs" ON public.packs FOR DELETE TO public USING (true);

CREATE POLICY "Anyone can read pack_items" ON public.pack_items FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert pack_items" ON public.pack_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update pack_items" ON public.pack_items FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete pack_items" ON public.pack_items FOR DELETE TO public USING (true);
