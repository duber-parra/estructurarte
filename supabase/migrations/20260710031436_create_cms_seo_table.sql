/*
  # Create cms_seo table for admin-editable SEO metadata

  1. New Table
    - `cms_seo`
      - `id` (uuid, primary key)
      - `title` (text) - Meta / Open Graph title
      - `description` (text) - Meta / Open Graph description
      - ` `og_image_url` (text) - Open Graph / Twitter image URL
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Public read access (anon + authenticated)
    - Anon + authenticated write access (matches existing CMS tables pattern)
*/

CREATE TABLE IF NOT EXISTS cms_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text DEFAULT 'Estructurarte | Ingeniería Estructural Metálica · NSR-10 · Colombia',
  description text DEFAULT 'Ingeniería estructural metálica en Colombia. Diseño BIM, memoria de cálculo NSR-10, cimentaciones ligeras y 0% rechazos en curaduría. Construye en la mitad del tiempo.',
  og_image_url text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cms_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to seo"
  ON cms_seo FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon and authenticated to update seo"
  ON cms_seo FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default row
INSERT INTO cms_seo (title, description, og_image_url)
SELECT
  'Estructurarte | Ingeniería Estructural Metálica · NSR-10 · Colombia',
  'Ingeniería estructural metálica en Colombia. Diseño BIM, memoria de cálculo NSR-10, cimentaciones ligeras y 0% rechazos en curaduría. Construye en la mitad del tiempo.',
  ''
WHERE NOT EXISTS (SELECT 1 FROM cms_seo);
