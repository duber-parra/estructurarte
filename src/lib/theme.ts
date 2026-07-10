import { Settings, supabase } from './supabase';

const DEFAULTS: Settings = {
  id: '',
  primary_color: '#d4a853',
  secondary_color: '#1e2530',
  bg_color: '#0a0a0b',
  text_color: '#e8e6e1',
  updated_at: '',
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(212, 168, 83, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function mix(hex: string, target: string, weight: number): string {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  if (!a || !b) return hex;
  const r = Math.round(a.r * (1 - weight) + b.r * weight);
  const g = Math.round(a.g * (1 - weight) + b.g * weight);
  const bl = Math.round(a.b * (1 - weight) + b.b * weight);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

function darken(hex: string, amount: number): string {
  return mix(hex, '#000000', amount);
}

export function applyTheme(settings: Settings | null) {
  const s = settings || DEFAULTS;
  const root = document.documentElement;
  root.style.setProperty('--accent', s.primary_color);
  root.style.setProperty('--bg', s.bg_color);
  root.style.setProperty('--text', s.text_color);
  root.style.setProperty('--steel', s.secondary_color);
  root.style.setProperty('--bg2', darken(s.bg_color, 0.04));
  root.style.setProperty('--bg3', darken(s.bg_color, 0.08));
  root.style.setProperty('--border', rgba('#ffffff', 0.07));
  root.style.setProperty('--border2', rgba('#ffffff', 0.12));
  root.style.setProperty('--dim', mix(s.text_color, '#000000', 0.5));
  root.style.setProperty('--dim2', mix(s.text_color, '#000000', 0.65));
}

export async function loadAndApplyTheme(): Promise<Settings | null> {
  try {
    const { data } = await supabase.from('cms_settings').select('*').maybeSingle();
    applyTheme(data as Settings | null);
    return data as Settings | null;
  } catch {
    applyTheme(null);
    return null;
  }
}
