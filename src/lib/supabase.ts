import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Hero {
  id: string;
  eyebrow: string;
  headline: string;
  sub: string;
  updated_at: string;
}

export interface Service {
  id: string;
  icon_key: string;
  name: string;
  tag: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Engineer {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Image {
  id: string;
  image_url: string;
  caption: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  updated_at: string;
}

export interface SEO {
  id: string;
  title: string;
  description: string;
  og_image_url: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  primary_color: string;
  secondary_color: string;
  bg_color: string;
  text_color: string;
  updated_at: string;
}
