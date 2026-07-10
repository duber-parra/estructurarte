import { Hero, Service, Engineer, FAQ, Image, Contact, Settings } from '../../lib/supabase';
import { useState, useEffect, useRef } from 'react';

// Hero Section
export function HeroSection({ hero, settings }: { hero: Hero | null; settings: Settings | null }) {
  const lines = hero?.headline?.split('\n') || ['CONSTRUYE', 'EN LA MITAD', 'DEL TIEMPO.'];

  // Parse stats
  const projects = settings?.stat_projects || '+500.';
  const rejections = settings?.stat_rejections || '0%';
  const time = settings?.stat_time || '−50%';

  // Format suffix extraction
  const projectsNum = projects.replace(/[^0-9+-]/g, '');
  const projectsSuff = projects.replace(/[0-9+-]/g, '');
  const rejectionsNum = rejections.replace(/[^0-9+-]/g, '');
  const rejectionsSuff = rejections.replace(/[0-9+-]/g, '');
  const timeNum = time.replace(/[^0-9+-−]/g, '');
  const timeSuff = time.replace(/[0-9+-−]/g, '');

  return (
    <section id="hero">
      <div className="h-gridbg"></div>
      <div className="h-glow"></div>
      <div className="h-eyebrow ha ha0">{hero?.eyebrow || 'Ingeniería Estructural Metálica · Colombia · NSR-10'}</div>
      <h1 className="h-hl ha ha1">
        {lines.map((line, i) => (
          <span key={i}>
            {i === 1 ? <span className="gold">{line}</span> : line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </h1>
      <p className="h-sub ha ha2" dangerouslySetInnerHTML={{ __html: hero?.sub || 'La ingeniería <strong>rápida, limpia y legal</strong> que hace viable tu construcción metálica, eliminando rechazos en curaduría desde el primer diseño.' }}></p>
      <div className="h-acts ha ha3">
        <a href="#cta-final" className="btn-p rh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          Agendar Cita Técnica
        </a>
        <a href="#services" className="btn-g rh">
          Ver Servicios
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
      <div className="h-stats ha ha4">
        <div><div className="hs-n">{projectsNum}<span>{projectsSuff}</span></div><div className="hs-l">Proyectos Aprobados</div></div>
        <div><div className="hs-n">{rejectionsNum}<span>{rejectionsSuff}</span></div><div className="hs-l">Rechazos en Curaduría</div></div>
        <div><div className="hs-n">{timeNum}<span>{timeSuff}</span></div><div className="hs-l">Tiempo vs Tradicional</div></div>
      </div>
      <div className="scroll-hint">
        <svg viewBox="0 0 24 24" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
        <span>Desliza</span>
      </div>
    </section>
  );
}

// Ticker Band
export function TickerBand({ settings }: { settings: Settings | null }) {
  const rawText = settings?.ticker_text || 'NSR-10 CERTIFICADO;DISEÑO BIM + CNC;CERO RECHAZOS EN CURADURÍA;ENTREGA EN LA MITAD DEL TIEMPO;CONEXIONES APERNADAS ASTM;CIMENTACIONES LIGERAS';
  const items = rawText.split(';').map(item => item.trim()).filter(Boolean);

  return (
    <div className="ticker-band" aria-hidden="true">
      <div className="ticker-inner">
        {Array(4).fill(null).map((_, i) => (
          <span key={i} style={{ display: 'contents' }}>
            {items.map((item, idx) => (
              <span key={idx} style={{ display: 'contents' }}>
                <span>{item}</span>
                <span className="td">◆</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

// Services Section
const SVGS: Record<string, string> = {
  grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
};

export function ServicesSection({ services }: { services: Service[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleScroll = () => {
      const idx = Math.round(track.scrollLeft / (track.scrollWidth / services.length));
      setActiveIndex(idx);
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, [services.length]);

  return (
    <section id="services">
      <div className="svc-intro">
        <div>
          <div className="sl fu">Servicios</div>
          <h2 className="st fu d1">LO QUE<br/>HACEMOS</h2>
        </div>
        <p className="fu d2">
          No solo calculamos vigas. Diseñamos el argumento técnico-legal que le permite a tu proyecto{' '}
          <strong>pasar por curaduría sin obstáculos</strong> y construirse en el menor tiempo posible.
        </p>
      </div>

      <div className="svc-grid">
        {services.map((service) => (
          <div key={service.id} className="svc-card rh">
            <div className="svc-icon" dangerouslySetInnerHTML={{ __html: SVGS[service.icon_key] || SVGS.clock }} />
            <div className="svc-name">{service.name}</div>
            <span className="svc-tag">{service.tag}</span>
            <div className="svc-desc" style={{ display: 'none', marginTop: '0.75rem' }}>{service.description}</div>
          </div>
        ))}
      </div>

      <div className="svc-swipe-wrap">
        <div className="svc-swipe-track" ref={trackRef}>
          {services.map((service) => (
            <div key={service.id} className="svc-card">
              <div className="svc-icon" dangerouslySetInnerHTML={{ __html: SVGS[service.icon_key] || SVGS.clock }} />
              <div className="svc-name">{service.name}</div>
              <span className="svc-tag">{service.tag}</span>
              <div className="svc-desc" style={{ marginTop: '0.75rem' }}>{service.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="svc-dots">
        {services.map((_, i) => (
          <div key={i} className={`svc-dot ${i === activeIndex ? 'active' : ''}`} />
        ))}
      </div>
    </section>
  );
}

// Copy Section
export function CopySection() {
  return (
    <section id="copy">
      <div className="sl fu">Hablamos tu idioma</div>
      <h2 className="st fu d1">TÉCNICA<br/>TRADUCIDA</h2>
      <p className="fu d2" style={{ color: 'var(--dim)', maxWidth: '480px', marginTop: '1rem', fontWeight: 300 }}>
        No te vendemos vigas. Te vendemos el resultado.
      </p>
      <div className="copy-grid fu d3">
        <div className="copy-row">
          <div className="copy-cell tech">
            <div className="copy-lbl">Técnico</div>
            Conexiones Apernadas ASTM A325
          </div>
          <div className="copy-arrow">
            <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
          <div className="copy-cell human">
            <div className="copy-lbl" style={{ color: 'var(--accent)' }}>Beneficio</div>
            <strong>Seguridad certificada</strong> — uniones desmontables, limpias, sin soldadura en sitio.
          </div>
        </div>
        <div className="copy-row">
          <div className="copy-cell tech">
            <div className="copy-lbl">Técnico</div>
            Perfil IPE con eje neutro optimizado
          </div>
          <div className="copy-arrow">
            <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
          <div className="copy-cell human">
            <div className="copy-lbl" style={{ color: 'var(--accent)' }}>Beneficio</div>
            <strong>Espacios libres más amplios</strong> — sin columnas que interrumpan tu diseño.
          </div>
        </div>
        <div className="copy-row">
          <div className="copy-cell tech">
            <div className="copy-lbl">Técnico</div>
            Memoria de cálculo NSR-10 Cap. F
          </div>
          <div className="copy-arrow">
            <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
          <div className="copy-cell human">
            <div className="copy-lbl" style={{ color: 'var(--accent)' }}>Beneficio</div>
            <strong>Licencia aprobada a la primera</strong> — sin devoluciones costosas.
          </div>
        </div>
        <div className="copy-row">
          <div className="copy-cell tech">
            <div className="copy-lbl">Técnico</div>
            Prefabricación fuera de sitio
          </div>
          <div className="copy-arrow">
            <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
          <div className="copy-cell human">
            <div className="copy-lbl" style={{ color: 'var(--accent)' }}>Beneficio</div>
            <strong>Obra limpia en la mitad del tiempo</strong> — menos riesgo, menos costo.
          </div>
        </div>
        <div className="copy-row">
          <div className="copy-cell tech">
            <div className="copy-lbl">Técnico</div>
            Galvanizado en caliente + primer epoxi
          </div>
          <div className="copy-arrow">
            <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
          <div className="copy-cell human">
            <div className="copy-lbl" style={{ color: 'var(--accent)' }}>Beneficio</div>
            <strong>50+ años sin corrosión</strong> — activo que conserva su valor.
          </div>
        </div>
      </div>
    </section>
  );
}

// Diferencial Section
export function DiferencialSection() {
  return (
    <section id="diferencial">
      <div className="sl fu">Diferencial</div>
      <h2 className="st fu d1">CERO<br/>RECHAZOS.</h2>
      <div className="diff-grid">
        <div className="diff-text fu d2">
          <p>
            La mayoría de los rechazos en curaduría no son por fallas de diseño. Son por{' '}
            <strong>desconocimiento del POT, normativa específica del predio o errores de presentación documental</strong>.
          </p>
          <p>
            Nuestro proceso integra la revisión jurídico-urbanística desde el primer día. El ingeniero dueño actúa como{' '}
            <strong>estratega legal-técnico</strong>, no solo como calculista.
          </p>
          <div className="zero-badge">
            <svg viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            0% Rechazos en Curaduría
          </div>
        </div>
        <div className="timeline fu d3">
          <div className="tl-step done">
            <div className="tl-dot">✓</div>
            <div className="tl-content">
              <div className="tl-title">Análisis del Lote</div>
              <div className="tl-note">POT · Usos · Restricciones</div>
            </div>
          </div>
          <div className="tl-step done">
            <div className="tl-dot">✓</div>
            <div className="tl-content">
              <div className="tl-title">Diseño Estructural BIM</div>
              <div className="tl-note">Modelado · Optimización</div>
            </div>
          </div>
          <div className="tl-step done">
            <div className="tl-dot">✓</div>
            <div className="tl-content">
              <div className="tl-title">Memoria NSR-10</div>
              <div className="tl-note">Sismo resistente · Cap. F</div>
            </div>
          </div>
          <div className="tl-step active">
            <div className="tl-dot">→</div>
            <div className="tl-content">
              <div className="tl-title">Radicación en Curaduría</div>
              <div className="tl-note">Paquete documental completo</div>
            </div>
          </div>
          <div className="tl-step">
            <div className="tl-dot" style={{ color: 'var(--check)', borderColor: 'var(--check)', background: 'rgba(61,214,140,.1)', fontSize: '1.1rem' }}>✓</div>
            <div className="tl-content">
              <div className="tl-title" style={{ color: 'var(--check)', fontSize: '1.35rem' }}>APROBADO ✓</div>
              <div className="tl-note">Licencia en mano · Inicio inmediato</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Confianza Section
export function ConfianzaSection({ engineer, settings }: { engineer: Engineer | null; settings: Settings | null }) {
  // Parse stats
  const projects = settings?.stat_projects || '+500.';
  const rejections = settings?.stat_rejections || '0%';
  const time = settings?.stat_time || '−50%';
  const experience = settings?.stat_experience || '15+';

  // Format suffix extraction
  const projectsNum = projects.replace(/[^0-9+-]/g, '');
  const projectsSuff = projects.replace(/[0-9+-]/g, '');
  const rejectionsNum = rejections.replace(/[^0-9+-]/g, '');
  const rejectionsSuff = rejections.replace(/[0-9+-]/g, '');
  const timeNum = time.replace(/[^0-9+-−]/g, '');
  const timeSuff = time.replace(/[0-9+-−]/g, '');
  const experienceNum = experience.replace(/[^0-9+-]/g, '');
  const experienceSuff = experience.replace(/[0-9+-]/g, '');

  return (
    <section id="confianza">
      <div className="sl fu">Prueba Social</div>
      <h2 className="st fu d1">NÚMEROS<br/>REALES.</h2>
      <div className="trust-grid fu d2">
        <div className="trust-card">
          <div className="trust-num">{projectsNum}<span>{projectsSuff}</span></div>
          <div className="trust-lbl">Proyectos Aprobados</div>
        </div>
        <div className="trust-card">
          <div className="trust-num">{rejectionsNum}<span>{rejectionsSuff}</span></div>
          <div className="trust-lbl">Tasa de Rechazo</div>
        </div>
        <div className="trust-card">
          <div className="trust-num">{timeNum}<span>{timeSuff}</span></div>
          <div className="trust-lbl">Tiempo vs Mampostería</div>
        </div>
        <div className="trust-card">
          <div className="trust-num">{experienceNum}<span>{experienceSuff}</span></div>
          <div className="trust-lbl">Años de Experiencia</div>
        </div>
      </div>
      <div className="seals fu d3">
        <div className="seal">
          <svg viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          NSR-10
        </div>
        <div className="seal">
          <svg viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          BIM Level 2
        </div>
        <div className="seal">
          <svg viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          ASTM International
        </div>
        <div className="seal">
          <svg viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Copnia
        </div>
      </div>
      <div className="eng-card fu">
        <div className="eng-photo">
          {engineer?.photo_url && (
            <img src={engineer.photo_url} alt={engineer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
        <div className="eng-info">
          <h3>{engineer?.name || 'Ing Jhon Jaramillo'}</h3>
          <div className="eng-role">{engineer?.role || 'Ing. Civil · MSc Estructuras · Fundador'}</div>
          <p dangerouslySetInnerHTML={{ __html: engineer?.bio || 'Más de 15 años diseñando estructuras metálicas en Colombia.' }}></p>
        </div>
      </div>
    </section>
  );
}

// Gallery Section
export function GallerySection({ images }: { images: Image[] }) {
  return (
    <section id="gallery">
      <div className="sl fu">Portafolio</div>
      <h2 className="st fu d1">PROYECTOS<br/>EJECUTADOS.</h2>
      <div className="gal-grid fu d2">
        {images.length === 0 ? (
          <p className="gal-empty">Imágenes administradas desde el panel admin.</p>
        ) : (
          images.map((img) => (
            <div key={img.id} className="gal-img">
              <img src={img.image_url} alt={img.caption || 'Proyecto'} loading="lazy" />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

// FAQ Section
export function FAQSection({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq">
      <div className="sl fu">Objeciones Resueltas</div>
      <h2 className="st fu d1">LO QUE<br/>TE PREGUNTAS.</h2>
      <div className="faq-list fu d2">
        {faqs.map((faq, index) => (
          <div key={faq.id} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
            <button className="faq-q rh" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
              {faq.question}
              <span className="faq-icon">+</span>
            </button>
            <div className="faq-a">
              <div className="faq-a-inner" dangerouslySetInnerHTML={{ __html: faq.answer }}></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// CTA Final Section
export function CTAFinalSection({ contact }: { contact: Contact | null }) {
  return (
    <section id="cta-final">
      <div className="sl">Próximo Paso</div>
      <h2 className="st">TU PROYECTO<br/>EMPIEZA HOY.</h2>
      <p className="cta-sub">
        Una cita técnica gratuita. Te decimos si tu lote es viable, qué área puedes construir y en cuánto tiempo.
      </p>
      <div className="cta-acts">
        <a href={`tel:${contact?.phone || '+573214502246'}`} className="btn-p rh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.63a16 16 0 006.29 6.29l1.32-1.32a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
          </svg>
          Llamar Ahora
        </a>
        <a href={`https://wa.me/${contact?.whatsapp || '573214502246'}`} className="btn-g rh" target="_blank" rel="noopener noreferrer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          Enviar Planos por WhatsApp
        </a>
      </div>
    </section>
  );
}

// Mobile CTA
export function MobileCTA({ contact }: { contact: Contact | null }) {
  return (
    <div className="mob-cta">
      <a href={`tel:${contact?.phone || '+573214502246'}`} className="bc rh">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.63a16 16 0 006.29 6.29l1.32-1.32a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
        </svg>
        Llamar
      </a>
      <a href={`https://wa.me/${contact?.whatsapp || '573214502246'}`} className="bw rh" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        WhatsApp
      </a>
    </div>
  );
}

// Bottom Nav
export function BottomNav() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const secIds = ['hero', 'services', 'diferencial', 'faq'];
    const bnMap: Record<string, string> = { hero: 'hero', services: 'services', diferencial: 'diferencial', faq: 'faq' };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.id;
            const target = bnMap[id];
            if (target) setActiveSection(target);
          }
        });
      },
      { threshold: 0.4 }
    );

    secIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return (
    <nav className="bot-nav">
      <a href="#hero" className={`bni ${activeSection === 'hero' ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        </svg>
        <span>Inicio</span>
      </a>
      <a href="#services" className={`bni ${activeSection === 'services' ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
        </svg>
        <span>Servicios</span>
      </a>
      <a href="#diferencial" className={`bni ${activeSection === 'diferencial' ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24">
          <polyline points="22 4 12 14.01 9 11.01"/>
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
        </svg>
        <span>Info</span>
      </a>
      <a href="#faq" className={`bni ${activeSection === 'faq' ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>FAQ</span>
      </a>
    </nav>
  );
}

// Footer
export function Footer() {
  return (
    <footer className="footer-v2">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="fl">ESTRUC<span>T</span>URARTE</div>
          <p className="footer-tagline">Ingeniería estructural rápida, limpia y legal que hace viable tu construcción metálica.</p>
        </div>
        
        <div className="footer-col">
          <h4>Navegación</h4>
          <ul>
            <li><a href="#services">Servicios</a></li>
            <li><a href="#diferencial">Diferencial</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#/admin">Admin</a></li>
          </ul>
        </div>
        
        <div className="footer-col">
          <h4>Contacto</h4>
          <ul className="footer-contact">
            <li>Tel: +57 321 4502246</li>
            <li>
              <a href="https://wa.me/573163195050" target="_blank" rel="noopener noreferrer">
                WhatsApp: +57 316 319 5050
              </a>
            </li>
            <li>Email: contacto@estructurarte.co</li>
          </ul>
        </div>
        
        <div className="footer-col">
          <div className="footer-allied-text">Alianza de Diseño</div>
          <a href="https://wa.me/573163195050" target="_blank" rel="noopener noreferrer" className="footer-deko" aria-label="Contactar a Deko Parra por WhatsApp">
            <img src="https://res.cloudinary.com/dm75skole/image/upload/v1777624835/Logo_Duber_zhagkk.png" alt="Duber Parra Diseño Integral" className="h-12 w-auto object-contain brightness-0 invert hover:opacity-80 transition-opacity" loading="lazy" decoding="async" />
          </a>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="fc">© 2026 Estructurarte · NSR-10 · Colombia</div>
        <div className="footer-credit">Diseñado por <span>Duber Parra</span></div>
      </div>
    </footer>
  );
}
