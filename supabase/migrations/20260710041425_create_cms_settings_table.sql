/*
# Create cms_settings table for theme/color customization

1. New Tables
- `cms_settings`: single-row table storing site-wide appearance settings.
  - `id` (uuid, primary key, default gen_random_uuid())
  - `primary_color` (text, default '#d4a853') — main accent color used across the site
  - `secondary_color` (text, default '#1e2530') — secondary/steel color
  - `bg_color` (text, default '#0a0a0b') — page background color
  - `text_color` (text, default '#e8e6e1') — main text color
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `cms_settings`.
- Allow anon + authenticated CRUD (single-tenant, no auth screen).
- Seed one default row so the site has settings on first load.

3. Notes
- Only one row should exist. The app reads it with `.maybeSingle()`.
- Colors are stored as hex strings and applied as CSS custom properties at runtime.
*/

CREATE TABLE IF NOT EXISTS cms_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_color text NOT NULL DEFAULT '#d4a853',
  secondary_color text NOT NULL DEFAULT '#1e2530',
  bg_color text NOT NULL DEFAULT '#0a0a0b',
  text_color text NOT NULL DEFAULT '#e8e6e1',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON cms_settings;
CREATE POLICY "anon_select_settings" ON cms_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON cms_settings;
CREATE POLICY "anon_insert_settings" ON cms_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON cms_settings;
CREATE POLICY "anon_update_settings" ON cms_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_settings" ON cms_settings;
CREATE POLICY "anon_delete_settings" ON cms_settings FOR DELETE
  TO anon, authenticated USING (true);

-- Seed default row
INSERT INTO cms_settings (id, primary_color, secondary_color, bg_color, text_color)
VALUES ('00000000-0000-0000-0000-000000000001', '#d4a853', '#1e2530', '#0a0a0b', '#e8e6e1')
ON CONFLICT (id) DO NOTHING;
