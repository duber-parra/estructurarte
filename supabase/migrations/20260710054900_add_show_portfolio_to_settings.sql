-- Alter cms_settings table to add show_portfolio column
ALTER TABLE cms_settings ADD COLUMN IF NOT EXISTS show_portfolio boolean NOT NULL DEFAULT true;

-- Update the existing settings row
UPDATE cms_settings
SET show_portfolio = COALESCE(show_portfolio, true)
WHERE id = '00000000-0000-0000-0000-000000000001' OR id = 'local';
