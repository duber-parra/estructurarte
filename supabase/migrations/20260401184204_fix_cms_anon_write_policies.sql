/*
  # Fix CMS Tables - Allow Anonymous Write Access

  ## Problem
  The admin panel uses PIN-based authentication (not Supabase Auth), so the
  browser operates as the `anon` role. All UPDATE/INSERT/DELETE policies were
  restricted to `authenticated` only, causing silent failures when saving data.

  ## Changes
  - Drop all write policies that only allowed `authenticated`
  - Recreate them to also include `anon` role
  - Affects: cms_hero, cms_services, cms_engineer, cms_faq, cms_images, cms_contact
*/

-- cms_hero
DROP POLICY IF EXISTS "Allow authenticated users to update hero" ON cms_hero;
CREATE POLICY "Allow anon and authenticated to update hero"
  ON cms_hero FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- cms_services
DROP POLICY IF EXISTS "Allow authenticated users to insert services" ON cms_services;
DROP POLICY IF EXISTS "Allow authenticated users to update services" ON cms_services;
DROP POLICY IF EXISTS "Allow authenticated users to delete services" ON cms_services;

CREATE POLICY "Allow anon and authenticated to insert services"
  ON cms_services FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon and authenticated to update services"
  ON cms_services FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon and authenticated to delete services"
  ON cms_services FOR DELETE
  TO anon, authenticated
  USING (true);

-- cms_engineer
DROP POLICY IF EXISTS "Allow authenticated users to update engineer" ON cms_engineer;
CREATE POLICY "Allow anon and authenticated to update engineer"
  ON cms_engineer FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- cms_faq
DROP POLICY IF EXISTS "Allow authenticated users to insert faq" ON cms_faq;
DROP POLICY IF EXISTS "Allow authenticated users to update faq" ON cms_faq;
DROP POLICY IF EXISTS "Allow authenticated users to delete faq" ON cms_faq;

CREATE POLICY "Allow anon and authenticated to insert faq"
  ON cms_faq FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon and authenticated to update faq"
  ON cms_faq FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon and authenticated to delete faq"
  ON cms_faq FOR DELETE
  TO anon, authenticated
  USING (true);

-- cms_images
DROP POLICY IF EXISTS "Allow authenticated users to insert images" ON cms_images;
DROP POLICY IF EXISTS "Allow authenticated users to update images" ON cms_images;
DROP POLICY IF EXISTS "Allow authenticated users to delete images" ON cms_images;

CREATE POLICY "Allow anon and authenticated to insert images"
  ON cms_images FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon and authenticated to update images"
  ON cms_images FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon and authenticated to delete images"
  ON cms_images FOR DELETE
  TO anon, authenticated
  USING (true);

-- cms_contact
DROP POLICY IF EXISTS "Allow authenticated users to update contact" ON cms_contact;
CREATE POLICY "Allow anon and authenticated to update contact"
  ON cms_contact FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
