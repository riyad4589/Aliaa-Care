INSERT INTO storage.buckets (id, name, public) VALUES ('packaging-images', 'packaging-images', true);

CREATE POLICY "Anyone can read packaging images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'packaging-images');
CREATE POLICY "Anyone can upload packaging images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'packaging-images');
CREATE POLICY "Anyone can delete packaging images" ON storage.objects FOR DELETE TO public USING (bucket_id = 'packaging-images');