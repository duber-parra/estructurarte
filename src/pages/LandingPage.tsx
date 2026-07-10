import { useEffect, useState } from 'react';
import { supabase, Hero, Service, Engineer, FAQ, Image, Contact, SEO, Settings, Diferencial } from '../lib/supabase';
import Navigation from '../components/landing/Navigation';
import HeroSection from '../components/landing/HeroSection';
import TickerBand from '../components/landing/TickerBand';
import ServicesSection from '../components/landing/ServicesSection';
import CopySection from '../components/landing/CopySection';
import DiferencialSection from '../components/landing/DiferencialSection';
import ConfianzaSection from '../components/landing/ConfianzaSection';
import GallerySection from '../components/landing/GallerySection';
import FAQSection from '../components/landing/FAQSection';
import CTAFinalSection from '../components/landing/CTAFinalSection';
import MobileCTA from '../components/landing/MobileCTA';
import BottomNav from '../components/landing/BottomNav';
import Footer from '../components/landing/Footer';
import '../styles/landing.css';

export default function LandingPage() {
  const [hero, setHero] = useState<Hero | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [engineer, setEngineer] = useState<Engineer | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [seo, setSeo] = useState<SEO | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [diferencial, setDiferencial] = useState<Diferencial | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (settings) {
      document.documentElement.style.setProperty('--accent', settings.primary_color);
      document.documentElement.style.setProperty('--steel', settings.secondary_color);
    }
  }, [settings]);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      const fuObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('vis');
              fuObs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.05 }
      );
      document.querySelectorAll('.fu').forEach((el) => fuObs.observe(el));
      return () => fuObs.disconnect();
    }, 50);
    return () => clearTimeout(timer);
  }, [loaded]);

  async function loadData() {
    try {
      const [heroRes, servicesRes, engineerRes, faqsRes, imagesRes, contactRes, seoRes, settingsRes, diferencialRes] = await Promise.all([
        supabase.from('cms_hero').select('*').maybeSingle(),
        supabase.from('cms_services').select('*').order('sort_order'),
        supabase.from('cms_engineer').select('*').maybeSingle(),
        supabase.from('cms_faq').select('*').order('sort_order'),
        supabase.from('cms_images').select('*').order('sort_order'),
        supabase.from('cms_contact').select('*').maybeSingle(),
        supabase.from('cms_seo').select('*').maybeSingle(),
        supabase.from('cms_settings').select('*').maybeSingle(),
        supabase.from('cms_diferencial').select('*').maybeSingle(),
      ]);

      if (heroRes.data) setHero(heroRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (engineerRes.data) setEngineer(engineerRes.data);
      if (faqsRes.data) setFaqs(faqsRes.data);
      if (imagesRes.data) setImages(imagesRes.data);
      if (contactRes.data) setContact(contactRes.data);
      if (seoRes.data) setSeo(seoRes.data);

      let finalDiferencial = diferencialRes.data;
      if (!finalDiferencial) {
        finalDiferencial = {
          id: 'local',
          eyebrow: 'Diferencial',
          headline: 'CERO\nRECHAZOS.',
          paragraph_1: 'La mayoría de los rechazos en curaduría no son por fallas de diseño. Son por <strong>desconocimiento del POT, normativa específica del predio o errores de presentación documental</strong>.',
          paragraph_2: 'Nuestro proceso integra la revisión jurídico-urbanística desde el primer día. El ingeniero dueño actúa como <strong>estratega legal-técnico</strong>, no solo como calculista.',
          badge_text: '0% Rechazos en Curaduría',
          step_1_title: 'Análisis del Lote', step_1_note: 'POT · Usos · Restricciones',
          step_2_title: 'Diseño Estructural BIM', step_2_note: 'Modelado · Optimización',
          step_3_title: 'Memoria NSR-10', step_3_note: 'Sismo resistente · Cap. F',
          step_4_title: 'Radicación en Curaduría', step_4_note: 'Paquete documental completo',
          step_5_title: 'APROBADO ✓', step_5_note: 'Licencia en mano · Inicio inmediato',
          show_section: true,
          updated_at: new Date().toISOString()
        };
      }
      setDiferencial(finalDiferencial);

      let finalSettings = settingsRes.data;
      if (!finalSettings) {
        const local = localStorage.getItem('estructurarte_settings');
        if (local) {
          finalSettings = JSON.parse(local);
        } else {
          finalSettings = {
            id: 'local',
            primary_color: '#d4a853',
            secondary_color: '#1e2530',
            stat_projects: '+500',
            stat_rejections: '0%',
            stat_time: '−50%',
            stat_experience: '15+',
            ticker_text: 'NSR-10 CERTIFICADO;DISEÑO BIM + CNC;CERO RECHAZOS EN CURADURÍA;ENTREGA EN LA MITAD DEL TIEMPO;CONEXIONES APERNADAS ASTM;CIMENTACIONES LIGERAS',
            show_portfolio: true,
            updated_at: new Date().toISOString()
          };
        }
      }
      if (finalSettings) {
        finalSettings.stat_projects = finalSettings.stat_projects || '+500';
        finalSettings.stat_rejections = finalSettings.stat_rejections || '0%';
        finalSettings.stat_time = finalSettings.stat_time || '−50%';
        finalSettings.stat_experience = finalSettings.stat_experience || '15+';
        finalSettings.ticker_text = finalSettings.ticker_text || 'NSR-10 CERTIFICADO;DISEÑO BIM + CNC;CERO RECHAZOS EN CURADURÍA;ENTREGA EN LA MITAD DEL TIEMPO;CONEXIONES APERNADAS ASTM;CIMENTACIONES LIGERAS';
        finalSettings.show_portfolio = finalSettings.show_portfolio !== false;
      }
      setSettings(finalSettings);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    if (!seo) return;
    if (seo.title) document.title = seo.title;
    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.head.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    if (seo.description) {
      setMeta('description', seo.description);
      setMeta('og:description', seo.description, 'property');
      setMeta('twitter:description', seo.description);
    }
    if (seo.title) {
      setMeta('og:title', seo.title, 'property');
      setMeta('twitter:title', seo.title);
    }
    const ogImage = seo.og_image_url || 'https://i.postimg.cc/JnWGtMmK/Cn-P-09072026-232507.png';
    setMeta('og:image', ogImage, 'property');
    setMeta('twitter:image', ogImage);
  }, [seo]);

  return (
    <div className="landing-page">
      <Navigation />
      <HeroSection hero={hero} settings={settings} />
      <TickerBand settings={settings} />
      {services.length > 0 && <ServicesSection services={services} />}
      <CopySection />
      {diferencial && diferencial.show_section && (diferencial.headline || diferencial.paragraph_1) && (
        <DiferencialSection diferencial={diferencial} />
      )}
      <ConfianzaSection engineer={engineer} settings={settings} />
      {settings?.show_portfolio !== false && images.length > 0 && <GallerySection images={images} />}
      {faqs.length > 0 && <FAQSection faqs={faqs} />}
      <CTAFinalSection contact={contact} />
      <MobileCTA contact={contact} />
      <BottomNav />
      <Footer contact={contact} />
    </div>
  );
}
