-- Fix 4: Unrestricted Storage Policies on product-images bucket
-- Drops the globally-permissive UPDATE/DELETE storage object policies
-- and replaces them with admin-only checks.

DROP POLICY IF EXISTS "Anyone can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete product images" ON storage.objects;

CREATE POLICY "Admins can update product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
