/*
  # Fix Storage Policies - Allow Anonymous Uploads

  ## Problem
  The admin panel uses PIN-based auth (not Supabase Auth), so users are
  unauthenticated (anon role) when uploading. The previous policies only
  allowed `authenticated` role, causing 403 RLS violations.

  ## Changes
  - Drop the old authenticated-only upload/update/delete policies
  - Create new policies that allow `anon` role to upload, update, delete
  - Keep public SELECT open for anon and authenticated
*/

-- Drop old policies that blocked anon uploads
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Allow anon and authenticated to upload
CREATE POLICY "Allow upload to estructurarte-images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'estructurarte-images');

-- Allow anon and authenticated to update
CREATE POLICY "Allow update in estructurarte-images"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'estructurarte-images')
WITH CHECK (bucket_id = 'estructurarte-images');

-- Allow anon and authenticated to delete
CREATE POLICY "Allow delete in estructurarte-images"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'estructurarte-images');
