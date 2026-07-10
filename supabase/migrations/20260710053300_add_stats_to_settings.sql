-- Alter cms_settings table to add custom stats and ticker text columns
ALTER TABLE cms_settings ADD COLUMN IF NOT EXISTS stat_projects text NOT NULL DEFAULT '+500';
ALTER TABLE cms_settings ADD COLUMN IF NOT EXISTS stat_rejections text NOT NULL DEFAULT '0%';
ALTER TABLE cms_settings ADD COLUMN IF NOT EXISTS stat_time text NOT NULL DEFAULT '−50%';
ALTER TABLE cms_settings ADD COLUMN IF NOT EXISTS stat_experience text NOT NULL DEFAULT '15+';
ALTER TABLE cms_settings ADD COLUMN IF NOT EXISTS ticker_text text NOT NULL DEFAULT 'NSR-10 CERTIFICADO;DISEÑO BIM + CNC;CERO RECHAZOS EN CURADURÍA;ENTREGA EN LA MITAD DEL TIEMPO;CONEXIONES APERNADAS ASTM;CIMENTACIONES LIGERAS';

-- Update the existing seed settings row to include the default values
UPDATE cms_settings
SET
  stat_projects = COALESCE(stat_projects, '+500'),
  stat_rejections = COALESCE(stat_rejections, '0%'),
  stat_time = COALESCE(stat_time, '−50%'),
  stat_experience = COALESCE(stat_experience, '15+'),
  ticker_text = COALESCE(ticker_text, 'NSR-10 CERTIFICADO;DISEÑO BIM + CNC;CERO RECHAZOS EN CURADURÍA;ENTREGA EN LA MITAD DEL TIEMPO;CONEXIONES APERNADAS ASTM;CIMENTACIONES LIGERAS')
WHERE id = '00000000-0000-0000-0000-000000000001' OR id = 'local';
