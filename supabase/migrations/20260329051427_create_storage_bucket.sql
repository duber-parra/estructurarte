/*
  # Create Storage Bucket for Images

  1. Storage
    - Create public bucket `estructurarte-images`
    - Allow public read access
    - Allow authenticated users to upload/delete

  2. Security
    - Public can view images
    - Only authenticated users can upload
    - Only authenticated users can delete
*/

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('estructurarte-images', 'estructurarte-images', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Allow public access to read images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Access to Images'
  ) THEN
    CREATE POLICY "Public Access to Images"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'estructurarte-images');
  END IF;
END $$;

-- Allow authenticated users to upload images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload images'
  ) THEN
    CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'estructurarte-images');
  END IF;
END $$;

-- Allow authenticated users to update images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can update images'
  ) THEN
    CREATE POLICY "Authenticated users can update images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'estructurarte-images')
    WITH CHECK (bucket_id = 'estructurarte-images');
  END IF;
END $$;

-- Allow authenticated users to delete images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can delete images'
  ) THEN
    CREATE POLICY "Authenticated users can delete images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'estructurarte-images');
  END IF;
END $$;
