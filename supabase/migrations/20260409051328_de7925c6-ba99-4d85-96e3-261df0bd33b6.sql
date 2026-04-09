
INSERT INTO storage.buckets (id, name, public) VALUES ('player-photos', 'player-photos', true);

CREATE POLICY "Anyone can view player photos" ON storage.objects FOR SELECT USING (bucket_id = 'player-photos');
CREATE POLICY "Anyone can upload player photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'player-photos');
CREATE POLICY "Anyone can update player photos" ON storage.objects FOR UPDATE USING (bucket_id = 'player-photos');
CREATE POLICY "Anyone can delete player photos" ON storage.objects FOR DELETE USING (bucket_id = 'player-photos');
