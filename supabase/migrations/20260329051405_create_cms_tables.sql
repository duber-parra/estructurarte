/*
  # Create CMS Tables for Estructurarte

  1. New Tables
    - `cms_hero`
      - `id` (uuid, primary key)
      - `eyebrow` (text) - Small text above headline
      - `headline` (text) - Main headline with line breaks
      - `sub` (text) - Subtitle with HTML support
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `cms_services`
      - `id` (uuid, primary key)
      - `icon_key` (text) - Icon identifier
      - `name` (text) - Service name
      - `tag` (text) - Service tag/category
      - `description` (text) - Service description
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cms_engineer`
      - `id` (uuid, primary key)
      - `name` (text) - Engineer name
      - `role` (text) - Engineer role/title
      - `bio` (text) - Biography with HTML support
      - `photo_url` (text) - URL to profile photo
      - `updated_at` (timestamptz)
    
    - `cms_faq`
      - `id` (uuid, primary key)
      - `question` (text) - FAQ question
      - `answer` (text) - FAQ answer with HTML support
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cms_images`
      - `id` (uuid, primary key)
      - `image_url` (text) - URL to stored image
      - `caption` (text) - Image caption
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cms_contact`
      - `id` (uuid, primary key)
      - `phone` (text) - Phone number
      - `whatsapp` (text) - WhatsApp number
      - `email` (text) - Email address
      - `address` (text) - Physical address
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Allow public read access for all CMS content
    - Restrict write access to authenticated users only
*/

-- Create cms_hero table
CREATE TABLE IF NOT EXISTS cms_hero (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow text DEFAULT 'Ingeniería Estructural Metálica · Colombia · NSR-10',
  headline text DEFAULT 'CONSTRUYE\nEN LA MITAD\nDEL TIEMPO.',
  sub text DEFAULT 'La ingeniería <strong>rápida, limpia y legal</strong> que hace viable tu construcción metálica.',
  updated_at timestamptz DEFAULT now()
);

-- Create cms_services table
CREATE TABLE IF NOT EXISTS cms_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon_key text NOT NULL DEFAULT 'clock',
  name text NOT NULL,
  tag text NOT NULL,
  description text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cms_engineer table
CREATE TABLE IF NOT EXISTS cms_engineer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text DEFAULT 'Ing Jhon Jaramillo',
  role text DEFAULT 'Ing. Civil · MSc Estructuras · Fundador',
  bio text DEFAULT 'Más de 15 años diseñando estructuras metálicas en Colombia.',
  photo_url text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- Create cms_faq table
CREATE TABLE IF NOT EXISTS cms_faq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cms_images table
CREATE TABLE IF NOT EXISTS cms_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cms_contact table
CREATE TABLE IF NOT EXISTS cms_contact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text DEFAULT '+57 321 4502246',
  whatsapp text DEFAULT '573214502246',
  email text DEFAULT 'contacto@estructurarte.co',
  address text DEFAULT 'Pereira, Risaralda · Colombia',
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE cms_hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_engineer ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_contact ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read access to hero"
  ON cms_hero FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to services"
  ON cms_services FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to engineer"
  ON cms_engineer FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to faq"
  ON cms_faq FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to images"
  ON cms_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to contact"
  ON cms_contact FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated write policies
CREATE POLICY "Allow authenticated users to update hero"
  ON cms_hero FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert services"
  ON cms_services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update services"
  ON cms_services FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete services"
  ON cms_services FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update engineer"
  ON cms_engineer FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert faq"
  ON cms_faq FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update faq"
  ON cms_faq FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete faq"
  ON cms_faq FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert images"
  ON cms_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update images"
  ON cms_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete images"
  ON cms_images FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update contact"
  ON cms_contact FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default data
INSERT INTO cms_hero (eyebrow, headline, sub)
SELECT 
  'Ingeniería Estructural Metálica · Colombia · NSR-10',
  E'CONSTRUYE\nEN LA MITAD\nDEL TIEMPO.',
  'La ingeniería <strong>rápida, limpia y legal</strong> que hace viable tu construcción metálica, eliminando rechazos en curaduría desde el primer diseño.'
WHERE NOT EXISTS (SELECT 1 FROM cms_hero);

INSERT INTO cms_engineer (name, role, bio, photo_url)
SELECT 
  'Ing Jhon Jaramillo',
  'Ing. Civil · MSc Estructuras · Fundador',
  'Más de 15 años diseñando estructuras metálicas en Colombia. <strong>El dueño del estudio es quien firma tus planos.</strong>',
  ''
WHERE NOT EXISTS (SELECT 1 FROM cms_engineer);

INSERT INTO cms_contact (phone, whatsapp, email, address)
SELECT 
  '+57 321 4502246',
  '573214502246',
  'contacto@estructurarte.co',
  'Pereira, Risaralda · Colombia'
WHERE NOT EXISTS (SELECT 1 FROM cms_contact);

-- Insert default services
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cms_services) THEN
    INSERT INTO cms_services (icon_key, name, tag, description, sort_order) VALUES
      ('grid', 'Diseño BIM', 'Modelado CNC', 'Modelamos cada pieza de tu estructura en 3D con tecnología BIM, generando planos de taller precisos para corte CNC. Cero desperdicios y ensamble como rompecabezas.', 1),
      ('star', 'Cimentaciones Ligeras', 'Fundaciones optimizadas', 'Fundaciones que aprovechan el menor peso de la estructura metálica. Menos concreto, menos excavación, menos dinero.', 2),
      ('layers', 'Consultoría NSR-10', 'Sismo Resistente', 'Memoria de cálculo estructural que exige la curaduría, con lenguaje técnico-legal que no da lugar a objeciones.', 3),
      ('home', 'Patología Estructural', 'Diagnóstico y Refuerzo', 'Evaluamos estructuras existentes con daños y diseñamos el reforzamiento para restaurar seguridad.', 4),
      ('file', 'Viabilidad Inicial', 'POT + Curaduría', 'Consultamos el POT y normas urbanísticas antes de diseñar, maximizando el área construible de tu lote.', 5),
      ('clock', 'Interventoría Técnica', 'Supervisión en obra', 'Supervisamos el montaje de tu estructura para garantizar calidad certificada, sin sorpresas al final.', 6);
  END IF;
END $$;

-- Insert default FAQs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cms_faq) THEN
    INSERT INTO cms_faq (question, answer, sort_order) VALUES
      ('¿El acero no hace ruido?', '<strong>Mito desmontado.</strong> El ruido es un problema de diseño, no del material. Con el correcto aislamiento acústico el comportamiento es igual o mejor que la mampostería.', 1),
      ('¿No se calienta mucho con techo metálico?', '<strong>El problema es la cubierta, no la estructura.</strong> Con un sistema de cubierta bien diseñado el confort térmico supera al de muchas edificaciones en mampostería.', 2),
      ('¿El acero se oxida? ¿Cuánto mantenimiento necesita?', '<strong>Con tratamiento correcto, virtualmente cero.</strong> Un sistema bien aplicado garantiza <strong>50+ años sin mantenimiento mayor</strong>.', 3),
      ('¿Es más costoso que construir en concreto?', '<strong>El cálculo total favorece al acero.</strong> Cimentación más ligera, menor tiempo de obra y menos desperdicio. Puedes ahorrar hasta 3-4 meses de obra.', 4),
      ('¿La curaduría acepta proyectos metálicos?', '<strong>Con documentación correcta, absolutamente.</strong> El NSR-10 Capítulo F regula las estructuras metálicas. Nuestro proceso tiene <strong>0% de devoluciones</strong>.', 5);
  END IF;
END $$;
