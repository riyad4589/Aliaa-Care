-- Fix 3: Broken Access Control on order_items and product_categories
-- Replaces the globally-permissive UPDATE/DELETE policies (USING (true))
-- with admin-role-checked equivalents.

-- Fix order_items
DROP POLICY IF EXISTS "Anyone can update order_items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can delete order_items" ON public.order_items;
CREATE POLICY "Admins update order_items" ON public.order_items
FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins delete order_items" ON public.order_items
FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Fix product_categories
DROP POLICY IF EXISTS "Anyone can update product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "Anyone can delete product_categories" ON public.product_categories;
CREATE POLICY "Admins update product_categories" ON public.product_categories
FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins delete product_categories" ON public.product_categories
FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
