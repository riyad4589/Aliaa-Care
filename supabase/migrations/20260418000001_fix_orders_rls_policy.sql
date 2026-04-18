-- Fix 2: Secure the Orders table (PII leak)
-- Drops the globally-permissive SELECT policy that allowed any anonymous
-- caller to read all orders including customer_name, customer_phone, customer_address.

-- Remove dangerous open SELECT policy
DROP POLICY IF EXISTS "Anyone can read orders" ON public.orders;

-- Only admins can view all orders
CREATE POLICY "Admins can view orders" ON public.orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Customers can only view their own orders
CREATE POLICY "Customers can view own orders" ON public.orders
FOR SELECT USING (auth.uid() = user_id);
