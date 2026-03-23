CREATE TABLE public.packaging (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '/placeholder.svg',
  cost_price NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.packaging ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read packaging" ON public.packaging FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert packaging" ON public.packaging FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update packaging" ON public.packaging FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete packaging" ON public.packaging FOR DELETE TO public USING (true);