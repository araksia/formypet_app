
-- Create a storage bucket for pet images
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-images', 'pet-images', true);

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Users can upload pet images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pet-images' AND 
  auth.role() = 'authenticated'
);

-- Create policy to allow public read access to pet images
CREATE POLICY "Public can view pet images" ON storage.objects
FOR SELECT USING (bucket_id = 'pet-images');

-- Create policy to allow users to update their own pet images
CREATE POLICY "Users can update their pet images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'pet-images' AND 
  auth.role() = 'authenticated'
);

-- Create policy to allow users to delete their own pet images
CREATE POLICY "Users can delete their pet images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pet-images' AND 
  auth.role() = 'authenticated'
);
