-- Enable the storage extension
CREATE EXTENSION IF NOT EXISTS "storage";

-- Create a storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true);

-- Allow public access to view images
CREATE POLICY "Give public access to product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'products'
    AND owner = auth.uid()
);

-- Allow authenticated users to update their own images
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'products'
    AND owner = auth.uid()
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'products'
    AND owner = auth.uid()
); 