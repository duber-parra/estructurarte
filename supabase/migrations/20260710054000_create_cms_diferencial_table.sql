-- Create cms_diferencial table
CREATE TABLE IF NOT EXISTS cms_diferencial (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow text DEFAULT 'Diferencial',
  headline text DEFAULT 'CERO' || chr(10) || 'RECHAZOS.',
  paragraph_1 text DEFAULT 'La mayoría de los rechazos en curaduría no son por fallas de diseño. Son por <strong>desconocimiento del POT, normativa específica del predio o errores de presentación documental</strong>.',
  paragraph_2 text DEFAULT 'Nuestro proceso integra la revisión jurídico-urbanística desde el primer día. El ingeniero dueño actúa como <strong>estratega legal-técnico</strong>, no solo como calculista.',
  badge_text text DEFAULT '0% Rechazos en Curaduría',
  
  step_1_title text DEFAULT 'Análisis del Lote',
  step_1_note text DEFAULT 'POT · Usos · Restricciones',
  
  step_2_title text DEFAULT 'Diseño Estructural BIM',
  step_2_note text DEFAULT 'Modelado · Optimización',
  
  step_3_title text DEFAULT 'Memoria NSR-10',
  step_3_note text DEFAULT 'Sismo resistente · Cap. F',
  
  step_4_title text DEFAULT 'Radicación en Curaduría',
  step_4_note text DEFAULT 'Paquete documental completo',
  
  step_5_title text DEFAULT 'APROBADO ✓',
  step_5_note text DEFAULT 'Licencia en mano · Inicio inmediato',
  
  show_section boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cms_diferencial ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "Allow public read access to diferencial"
  ON cms_diferencial FOR SELECT
  TO anon, authenticated
  USING (true);

-- Update policy
CREATE POLICY "Allow anon and authenticated to update diferencial"
  ON cms_diferencial FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert policy
CREATE POLICY "Allow anon and authenticated to insert diferencial"
  ON cms_diferencial FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Seed default values
INSERT INTO cms_diferencial (
  eyebrow, headline, paragraph_1, paragraph_2, badge_text,
  step_1_title, step_1_note,
  step_2_title, step_2_note,
  step_3_title, step_3_note,
  step_4_title, step_4_note,
  step_5_title, step_5_note,
  show_section
)
SELECT
  'Diferencial',
  E'CERO\nRECHAZOS.',
  'La mayoría de los rechazos en curaduría no son por fallas de diseño. Son por <strong>desconocimiento del POT, normativa específica del predio o errores de presentación documental</strong>.',
  'Nuestro proceso integra la revisión jurídico-urbanística desde el primer día. El ingeniero dueño actúa como <strong>estratega legal-técnico</strong>, no solo como calculista.',
  '0% Rechazos en Curaduría',
  'Análisis del Lote', 'POT · Usos · Restricciones',
  'Diseño Estructural BIM', 'Modelado · Optimización',
  'Memoria NSR-10', 'Sismo resistente · Cap. F',
  'Radicación en Curaduría', 'Paquete documental completo',
  'APROBADO ✓', 'Licencia en mano · Inicio inmediato',
  true
WHERE NOT EXISTS (SELECT 1 FROM cms_diferencial);
