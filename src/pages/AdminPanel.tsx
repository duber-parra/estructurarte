import { useState, useEffect } from 'react';
import { supabase, Hero, Service, Engineer, FAQ, Image, Contact, SEO, Settings } from '../lib/supabase';
import HtmlTextarea from '../components/HtmlTextarea';
import '../styles/admin.css';

function compressImage(file: File, maxW: number, maxH: number, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const ratio = Math.min(maxW / width, maxH / height, 1);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
        'image/jpeg',
        quality
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function AdminPanel() {
  const [currentPanel, setCurrentPanel] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loadedData, setLoadedData] = useState<any>(null);

  const [hero, setHero] = useState<Hero | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [engineer, setEngineer] = useState<Engineer | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [seo, setSeo] = useState<SEO | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [draggedServiceIndex, setDraggedServiceIndex] = useState<number | null>(null);
  const [draggedOverServiceIndex, setDraggedOverServiceIndex] = useState<number | null>(null);
  const [draggedFaqIndex, setDraggedFaqIndex] = useState<number | null>(null);
  const [draggedOverFaqIndex, setDraggedOverFaqIndex] = useState<number | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    if (settings) {
      document.documentElement.style.setProperty('--accent', settings.primary_color);
      document.documentElement.style.setProperty('--steel', settings.secondary_color);
    }
  }, [settings]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [heroRes, servicesRes, engineerRes, faqsRes, imagesRes, contactRes, seoRes, settingsRes] = await Promise.all([
      supabase.from('cms_hero').select('*').maybeSingle(),
      supabase.from('cms_services').select('*').order('sort_order'),
      supabase.from('cms_engineer').select('*').maybeSingle(),
      supabase.from('cms_faq').select('*').order('sort_order'),
      supabase.from('cms_images').select('*').order('sort_order'),
      supabase.from('cms_contact').select('*').maybeSingle(),
      supabase.from('cms_seo').select('*').maybeSingle(),
      supabase.from('cms_settings').select('*').maybeSingle(),
    ]);

    if (heroRes.data) setHero(heroRes.data);
    if (servicesRes.data) setServices(servicesRes.data);
    if (engineerRes.data) setEngineer(engineerRes.data);
    if (faqsRes.data) setFaqs(faqsRes.data);
    if (imagesRes.data) setImages(imagesRes.data);
    if (contactRes.data) setContact(contactRes.data);
    if (seoRes.data) setSeo(seoRes.data);

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
          updated_at: new Date().toISOString()
        };
      }
    }
    setSettings(finalSettings);

    setLoadedData({
      hero: heroRes.data,
      services: servicesRes.data,
      engineer: engineerRes.data,
      faqs: faqsRes.data,
      contact: contactRes.data,
      seo: seoRes.data,
      settings: finalSettings,
    });
    setDirty(false);
  }

  useEffect(() => {
    if (!loadedData) return;
    const changed =
      JSON.stringify(hero) !== JSON.stringify(loadedData.hero) ||
      JSON.stringify(services) !== JSON.stringify(loadedData.services) ||
      JSON.stringify(engineer) !== JSON.stringify(loadedData.engineer) ||
      JSON.stringify(faqs) !== JSON.stringify(loadedData.faqs) ||
      JSON.stringify(contact) !== JSON.stringify(loadedData.contact) ||
      JSON.stringify(seo) !== JSON.stringify(loadedData.seo) ||
      JSON.stringify(settings) !== JSON.stringify(loadedData.settings);
    setDirty(changed);
  }, [hero, services, engineer, faqs, contact, seo, settings, loadedData]);

  // Drag and Drop for Services
  function handleServiceDragStart(index: number) {
    setDraggedServiceIndex(index);
  }

  function handleServiceDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedServiceIndex === index) return;
    setDraggedOverServiceIndex(index);
  }

  function handleServiceDrop(index: number) {
    if (draggedServiceIndex === null) return;
    const updated = [...services];
    const [draggedItem] = updated.splice(draggedServiceIndex, 1);
    updated.splice(index, 0, draggedItem);
    const reordered = updated.map((item, idx) => ({
      ...item,
      sort_order: idx + 1
    }));
    setServices(reordered);
    setDraggedServiceIndex(null);
    setDraggedOverServiceIndex(null);
  }

  // Drag and Drop for FAQs
  function handleFaqDragStart(index: number) {
    setDraggedFaqIndex(index);
  }

  function handleFaqDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedFaqIndex === index) return;
    setDraggedOverFaqIndex(index);
  }

  function handleFaqDrop(index: number) {
    if (draggedFaqIndex === null) return;
    const updated = [...faqs];
    const [draggedItem] = updated.splice(draggedFaqIndex, 1);
    updated.splice(index, 0, draggedItem);
    const reordered = updated.map((item, idx) => ({
      ...item,
      sort_order: idx + 1
    }));
    setFaqs(reordered);
    setDraggedFaqIndex(null);
    setDraggedOverFaqIndex(null);
  }

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  async function saveAll() {
    setSaving(true);
    const errors: string[] = [];

    if (hero) {
      const { error } = await supabase.from('cms_hero').update({
        eyebrow: hero.eyebrow,
        headline: hero.headline,
        sub: hero.sub,
        updated_at: new Date().toISOString()
      }).eq('id', hero.id);
      if (error) errors.push(`Hero: ${error.message}`);
    }

    if (engineer) {
      const { error } = await supabase.from('cms_engineer').update({
        name: engineer.name,
        role: engineer.role,
        bio: engineer.bio,
        photo_url: engineer.photo_url,
        updated_at: new Date().toISOString()
      }).eq('id', engineer.id);
      if (error) errors.push(`Ingeniero: ${error.message}`);
    }

    if (contact) {
      const { error } = await supabase.from('cms_contact').update({
        phone: contact.phone,
        whatsapp: contact.whatsapp,
        email: contact.email,
        address: contact.address,
        updated_at: new Date().toISOString()
      }).eq('id', contact.id);
      if (error) errors.push(`Contacto: ${error.message}`);
    }

    if (seo) {
      const { error } = await supabase.from('cms_seo').update({
        title: seo.title,
        description: seo.description,
        og_image_url: seo.og_image_url,
        updated_at: new Date().toISOString()
      }).eq('id', seo.id);
      if (error) errors.push(`SEO: ${error.message}`);
    }

    if (settings) {
      if (settings.id !== 'local') {
        const { error } = await supabase.from('cms_settings').update({
          primary_color: settings.primary_color,
          secondary_color: settings.secondary_color,
          updated_at: new Date().toISOString()
        }).eq('id', settings.id);
        if (error) {
          errors.push(`Ajustes: ${error.message}`);
          localStorage.setItem('estructurarte_settings', JSON.stringify(settings));
        }
      } else {
        localStorage.setItem('estructurarte_settings', JSON.stringify(settings));
      }
    }

    for (const svc of services) {
      const { error } = await supabase.from('cms_services').update({
        name: svc.name,
        tag: svc.tag,
        icon_key: svc.icon_key,
        description: svc.description,
        sort_order: svc.sort_order,
        updated_at: new Date().toISOString()
      }).eq('id', svc.id);
      if (error) errors.push(`Servicio "${svc.name}": ${error.message}`);
    }

    for (const faq of faqs) {
      const { error } = await supabase.from('cms_faq').update({
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sort_order,
        updated_at: new Date().toISOString()
      }).eq('id', faq.id);
      if (error) errors.push(`FAQ "${faq.question}": ${error.message}`);
    }

    setDirty(false);
    setSaving(false);
    if (errors.length) {
      showToast(`⚠ ${errors[0]}`);
    } else {
      setLoadedData({ hero, services, engineer, faqs, contact, seo, settings });
      showToast('✓ Cambios guardados correctamente');
    }
  }

  async function deleteImage(id: string) {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar imagen?',
      message: '¿Estás seguro de que deseas eliminar esta imagen del portafolio?',
      onConfirm: async () => {
        await supabase.from('cms_images').delete().eq('id', id);
        setImages(images.filter(img => img.id !== id));
      }
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newImages: Image[] = [];

    for (const file of files) {
      let blob: Blob;
      try {
        blob = await compressImage(file, 1920, 1080);
      } catch {
        showToast(`⚠ Error procesando ${file.name}`);
        continue;
      }

      const fileName = `${Math.random().toString(36).substring(2)}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('estructurarte-images')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (uploadError) {
        showToast(`⚠ Storage: ${uploadError.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('estructurarte-images')
        .getPublicUrl(fileName);

      const { data: newImage, error: insertError } = await supabase
        .from('cms_images')
        .insert({
          image_url: urlData.publicUrl,
          caption: '',
          sort_order: images.length + newImages.length
        })
        .select()
        .maybeSingle();

      if (insertError) {
        showToast(`⚠ DB: ${insertError.message}`);
        continue;
      }

      if (newImage) newImages.push(newImage);
    }

    if (newImages.length) setImages([...images, ...newImages]);
    showToast(newImages.length ? `✓ ${newImages.length} imagen(es) guardada(s)` : '⚠ No se guardó ninguna imagen');
    e.target.value = '';
  }

  async function updateImageCaption(id: string, caption: string) {
    await supabase.from('cms_images').update({ caption }).eq('id', id);
    setImages(images.map(img => img.id === id ? { ...img, caption } : img));
  }

  async function handleEngineerPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    let blob: Blob;
    try {
      blob = await compressImage(file, 800, 800);
    } catch {
      showToast('⚠ Error procesando foto');
      return;
    }

    const fileName = `engineer-${Math.random().toString(36).substring(2)}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('estructurarte-images')
      .upload(fileName, blob, { contentType: 'image/jpeg' });

    if (uploadError) {
      showToast(`⚠ Storage: ${uploadError.message}`);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('estructurarte-images')
      .getPublicUrl(fileName);

    const newPhotoUrl = urlData.publicUrl;

    if (engineer) {
      const { error: dbError } = await supabase
        .from('cms_engineer')
        .update({ photo_url: newPhotoUrl, updated_at: new Date().toISOString() })
        .eq('id', engineer.id);

      if (dbError) {
        showToast(`⚠ DB: ${dbError.message}`);
        return;
      }

      setEngineer({ ...engineer, photo_url: newPhotoUrl });
    }

    showToast('✓ Foto guardada');
    e.target.value = '';
  }

  function showToast(msg: string) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    if (toast && toastMsg) {
      toastMsg.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2800);
    }
  }

  return (
    <div className="admin-container">
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)}></div>

      <aside className={`sidebar ${sidebarOpen ? 'mob-open' : ''}`}>
        <div className="sb-logo">
          <a href="#/">ESTRUC<span>T</span>URARTE</a>
          <div className="sb-badge">Panel Admin · CMS</div>
        </div>
        <nav className="sb-nav">
          <div className="sb-section">Contenido</div>
          <button className={`sb-item ${currentPanel === 'dashboard' ? 'active' : ''}`} onClick={() => { setCurrentPanel('dashboard'); setSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Dashboard
          </button>
          <button className={`sb-item ${currentPanel === 'hero' ? 'active' : ''}`} onClick={() => { setCurrentPanel('hero'); setSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24"><polyline points="23 7 13.5 15.5 8.5 10.5 1 17"/><polyline points="17 7 23 7 23 13"/></svg>
            Hero / Portada
          </button>
          <button className={`sb-item ${currentPanel === 'engineer' ? 'active' : ''}`} onClick={() => { setCurrentPanel('engineer'); setSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Ingeniero
          </button>
          <button className={`sb-item ${currentPanel === 'services' ? 'active' : ''}`} onClick={() => { setCurrentPanel('services'); setSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Servicios
          </button>
          <button className={`sb-item ${currentPanel === 'faq' ? 'active' : ''}`} onClick={() => { setCurrentPanel('faq'); setSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Preguntas FAQ
          </button>
          <button className={`sb-item ${currentPanel === 'gallery' ? 'active' : ''}`} onClick={() => { setCurrentPanel('gallery'); setSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Portafolio / Imágenes
          </button>
          <div className="sb-section" style={{ marginTop: '.5rem' }}>Ajustes</div>
          <button className={`sb-item ${currentPanel === 'contact' ? 'active' : ''}`} onClick={() => { setCurrentPanel('contact'); setSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07"/></svg>
            Contacto / CTAs
          </button>
          <button className={`sb-item ${currentPanel === 'seo' ? 'active' : ''}`} onClick={() => { setCurrentPanel('seo'); setSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            SEO / Redes
          </button>
          <button className={`sb-item ${currentPanel === 'settings' ? 'active' : ''}`} onClick={() => { setCurrentPanel('settings'); setSidebarOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Personalizar
          </button>
        </nav>
        <div className="sb-bottom">
          <a href="/" target="_blank" rel="noopener noreferrer" className="preview-btn">
            <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Ver Sitio
          </a>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button className="hamburger-admin" onClick={() => setSidebarOpen(true)}>
              <svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span className="topbar-title">{currentPanel.toUpperCase()}</span>
          </div>
          <div className="topbar-actions">
            <button className="save-btn" onClick={saveAll} disabled={saving}>
              <svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {saving ? 'Guardando...' : dirty ? 'Guardar *' : 'Guardar'}
            </button>
          </div>
        </div>

        <div className="content">
          {currentPanel === 'dashboard' && (
            <div className="panel active">
              <div className="section-h"><h2>Dashboard</h2></div>
              <div className="stats-grid">
                <div className="stat-mini"><div className="n">{services.length}<span>.</span></div><div className="l">Servicios</div></div>
                <div className="stat-mini"><div className="n">{faqs.length}<span>.</span></div><div className="l">FAQs</div></div>
                <div className="stat-mini"><div className="n">{images.length}<span>.</span></div><div className="l">Imágenes</div></div>
                <div className="stat-mini"><div className="n"><span style={{ fontSize: '1rem', color: 'var(--check)' }}>●</span></div><div className="l">Estado</div></div>
              </div>
              <div className="card">
                <div className="card-title">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Guía rápida
                </div>
                <p style={{ color: 'var(--dim)', fontSize: '.85rem', lineHeight: 1.75 }}>
                  Usa el menú lateral para editar cada sección del sitio. Todos los cambios se guardan automáticamente en Supabase.
                </p>
              </div>
            </div>
          )}

          {currentPanel === 'hero' && hero && (
            <div className="panel active">
              <div className="section-h"><h2>Hero / Portada</h2></div>
              <div className="card">
                <div className="card-title">
                  <svg viewBox="0 0 24 24"><polyline points="23 7 13.5 15.5 8.5 10.5 1 17"/></svg>
                  Contenido principal
                </div>
                <label>Texto eyebrow (línea pequeña superior)</label>
                <input
                  type="text"
                  value={hero.eyebrow}
                  onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })}
                  placeholder="Ingeniería Estructural Metálica · Colombia · NSR-10"
                />
                <label>Titular (usar \n para saltos de línea)</label>
                <textarea
                  rows={4}
                  value={hero.headline}
                  onChange={(e) => setHero({ ...hero, headline: e.target.value })}
                  placeholder="CONSTRUYE\nEN LA MITAD\nDEL TIEMPO."
                />
                <p className="hint">La línea del medio aparece en dorado automáticamente.</p>
                <HtmlTextarea
                  label="Subtítulo (acepta HTML)"
                  rows={3}
                  value={hero.sub}
                  onChange={(val) => setHero({ ...hero, sub: val })}
                  placeholder="La ingeniería <strong>rápida...</strong>"
                />
              </div>
            </div>
          )}

          {currentPanel === 'engineer' && engineer && (
            <div className="panel active">
              <div className="section-h"><h2>Ingeniero</h2></div>
              <div className="card">
                <div className="card-title">
                  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Información personal
                </div>
                <div className="g2">
                  <div>
                    <label>Nombre completo</label>
                    <input
                      type="text"
                      value={engineer.name}
                      onChange={(e) => setEngineer({ ...engineer, name: e.target.value })}
                      placeholder="Ing. Juan Pérez"
                    />
                  </div>
                  <div>
                    <label>Cargo / Rol</label>
                    <input
                      type="text"
                      value={engineer.role}
                      onChange={(e) => setEngineer({ ...engineer, role: e.target.value })}
                      placeholder="Ing. Civil · MSc Estructuras"
                    />
                  </div>
                </div>
                <HtmlTextarea
                  label="Biografía (acepta HTML)"
                  rows={4}
                  value={engineer.bio}
                  onChange={(val) => setEngineer({ ...engineer, bio: val })}
                  placeholder="Más de 15 años diseñando..."
                />
              </div>
              <div className="card">
                <div className="card-title">
                  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Foto de perfil
                </div>
                {engineer.photo_url && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                      <img src={engineer.photo_url} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={async () => {
                          await supabase.from('cms_engineer').update({ photo_url: '' }).eq('id', engineer.id);
                          setEngineer({ ...engineer, photo_url: '' });
                        }}
                        style={{ position: 'absolute', top: '.3rem', right: '.3rem', background: 'rgba(0,0,0,.7)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', color: 'var(--danger)', fontSize: '.9rem' }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
                <div className="upload-zone" onClick={() => document.getElementById('engineer-photo-input')?.click()}>
                  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <p><strong>Subir foto del ingeniero</strong></p>
                  <button type="button" className="upload-custom-btn" style={{ marginTop: '1rem', pointerEvents: 'none' }}>
                    ELEGIR ARCHIVO
                  </button>
                  <input
                    id="engineer-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleEngineerPhoto}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </div>
          )}

          {currentPanel === 'gallery' && (
            <div className="panel active">
              <div className="section-h"><h2>Portafolio / Imágenes</h2></div>
              <div className="card">
                <div className="card-title">
                  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Imágenes del portafolio
                </div>
                <div className="img-grid">
                  {images.map((img) => (
                    <div key={img.id} className="img-item">
                      <img src={img.image_url} alt={img.caption || ''} />
                      <input
                        className="img-caption-input"
                        type="text"
                        value={img.caption || ''}
                        placeholder="Pie de foto..."
                        onChange={(e) => updateImageCaption(img.id, e.target.value)}
                      />
                      <button className="del-img" onClick={() => deleteImage(img.id)}>×</button>
                    </div>
                  ))}
                </div>
                <div className="upload-zone" onClick={() => document.getElementById('portfolio-images-input')?.click()}>
                  <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p><strong>Subir imágenes</strong></p>
                  <button type="button" className="upload-custom-btn" style={{ marginTop: '1rem', pointerEvents: 'none' }}>
                    ELEGIR ARCHIVOS
                  </button>
                  <input
                    id="portfolio-images-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </div>
          )}

          {currentPanel === 'services' && (
            <div className="panel active">
              <div className="section-h"><h2>Servicios</h2></div>
              <div className="card">
                <div className="card-title">
                  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  Servicios del sitio (Arrastra para reordenar)
                </div>
                
                <div className="drag-list">
                  {services.map((svc, index) => (
                    <div
                      key={svc.id}
                      className={`draggable-card ${draggedServiceIndex === index ? 'dragging' : ''} ${draggedOverServiceIndex === index ? 'drag-over' : ''}`}
                      draggable
                      onDragStart={(e) => {
                        const target = e.target as HTMLElement;
                        if (!target.closest('.drag-handle')) {
                          e.preventDefault();
                          return;
                        }
                        handleServiceDragStart(index);
                      }}
                      onDragOver={(e) => handleServiceDragOver(e, index)}
                      onDragLeave={() => setDraggedOverServiceIndex(null)}
                      onDrop={() => handleServiceDrop(index)}
                      onDragEnd={() => {
                        setDraggedServiceIndex(null);
                        setDraggedOverServiceIndex(null);
                      }}
                    >
                      <div className="drag-handle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                      </div>
                      
                      <div className="draggable-card-content">
                        <div className="g2">
                          <div>
                            <label>Nombre</label>
                            <input
                              type="text"
                              value={svc.name}
                              onChange={(e) => setServices(services.map(s => s.id === svc.id ? { ...s, name: e.target.value } : s))}
                            />
                          </div>
                          <div>
                            <label>Etiqueta / Tag</label>
                            <input
                              type="text"
                              value={svc.tag}
                              onChange={(e) => setServices(services.map(s => s.id === svc.id ? { ...s, tag: e.target.value } : s))}
                            />
                          </div>
                        </div>
                        <label>Ícono (grid, star, layers, home, file, clock)</label>
                        <input
                          type="text"
                          value={svc.icon_key}
                          onChange={(e) => setServices(services.map(s => s.id === svc.id ? { ...s, icon_key: e.target.value } : s))}
                        />
                        <label>Descripción</label>
                        <textarea
                          rows={3}
                          value={svc.description}
                          onChange={(e) => setServices(services.map(s => s.id === svc.id ? { ...s, description: e.target.value } : s))}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--dim)', fontFamily: 'var(--FM)' }}>Posición: {svc.sort_order}</span>
                          <button
                            type="button"
                            className="delete-card-btn"
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: '¿Eliminar servicio?',
                                message: `¿Estás seguro de que deseas eliminar el servicio "${svc.name || 'este servicio'}"?`,
                                onConfirm: async () => {
                                  await supabase.from('cms_services').delete().eq('id', svc.id);
                                  setServices(services.filter(s => s.id !== svc.id).map((s, idx) => ({ ...s, sort_order: idx + 1 })));
                                }
                              });
                            }}
                            title="Eliminar servicio"
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="add-item-btn"
                  onClick={async () => {
                    const newOrder = services.length > 0 ? Math.max(...services.map(s => s.sort_order)) + 1 : 1;
                    const { data } = await supabase.from('cms_services').insert({
                      icon_key: 'clock',
                      name: 'Nuevo servicio',
                      tag: 'Etiqueta',
                      description: 'Descripción del servicio...',
                      sort_order: newOrder
                    }).select().single();
                    if (data) setServices([...services, data].sort((a, b) => a.sort_order - b.sort_order));
                  }}
                  style={{ marginTop: '1rem' }}
                >
                  + Agregar servicio
                </button>
              </div>
            </div>
          )}

          {currentPanel === 'faq' && (
            <div className="panel active">
              <div className="section-h"><h2>Preguntas FAQ</h2></div>
              <div className="card">
                <div className="card-title">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Preguntas frecuentes (Arrastra para reordenar)
                </div>
                
                <div className="drag-list">
                  {faqs.map((faq, index) => (
                    <div
                      key={faq.id}
                      className={`draggable-card ${draggedFaqIndex === index ? 'dragging' : ''} ${draggedOverFaqIndex === index ? 'drag-over' : ''}`}
                      draggable
                      onDragStart={(e) => {
                        const target = e.target as HTMLElement;
                        if (!target.closest('.drag-handle')) {
                          e.preventDefault();
                          return;
                        }
                        handleFaqDragStart(index);
                      }}
                      onDragOver={(e) => handleFaqDragOver(e, index)}
                      onDragLeave={() => setDraggedOverFaqIndex(null)}
                      onDrop={() => handleFaqDrop(index)}
                      onDragEnd={() => {
                        setDraggedFaqIndex(null);
                        setDraggedOverFaqIndex(null);
                      }}
                    >
                      <div className="drag-handle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                      </div>
                      
                      <div className="draggable-card-content">
                        <label>Pregunta</label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => setFaqs(faqs.map(f => f.id === faq.id ? { ...f, question: e.target.value } : f))}
                          style={{ marginBottom: '1rem' }}
                        />
                        <HtmlTextarea
                          label="Respuesta (acepta HTML)"
                          rows={3}
                          value={faq.answer}
                          onChange={(val) => setFaqs(faqs.map(f => f.id === faq.id ? { ...f, answer: val } : f))}
                          placeholder="Respuesta..."
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--dim)', fontFamily: 'var(--FM)' }}>Posición: {faq.sort_order}</span>
                          <button
                            type="button"
                            className="delete-card-btn"
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: '¿Eliminar pregunta?',
                                message: `¿Estás seguro de que deseas eliminar la pregunta "${faq.question || 'esta pregunta'}"?`,
                                onConfirm: async () => {
                                  await supabase.from('cms_faq').delete().eq('id', faq.id);
                                  setFaqs(faqs.filter(f => f.id !== faq.id).map((f, idx) => ({ ...f, sort_order: idx + 1 })));
                                }
                              });
                            }}
                            title="Eliminar pregunta"
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="add-item-btn"
                  onClick={async () => {
                    const newOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.sort_order)) + 1 : 1;
                    const { data } = await supabase.from('cms_faq').insert({
                      question: 'Nueva pregunta',
                      answer: 'Respuesta...',
                      sort_order: newOrder
                    }).select().single();
                    if (data) setFaqs([...faqs, data].sort((a, b) => a.sort_order - b.sort_order));
                  }}
                  style={{ marginTop: '1rem' }}
                >
                  + Agregar pregunta
                </button>
              </div>
            </div>
          )}

          {currentPanel === 'seo' && seo && (
            <div className="panel active">
              <div className="section-h"><h2>SEO / Redes Sociales</h2></div>
              <div className="card">
                <div className="card-title">
                  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Metadatos para buscadores y redes
                </div>
                <label>Título (meta / Open Graph)</label>
                <input
                  type="text"
                  value={seo.title}
                  onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                  placeholder="Estructurarte | Ingeniería Estructural Metálica · NSR-10"
                />
                <p className="hint">Aparece en la pestaña del navegador y como título al compartir por WhatsApp.</p>
                <label>Descripción (meta / Open Graph)</label>
                <textarea
                  rows={4}
                  value={seo.description}
                  onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                  placeholder="Ingeniería estructural metálica en Colombia..."
                />
                <p className="hint">Aparece como texto de vista previa al compartir por WhatsApp o redes sociales.</p>
                <label>URL de imagen para compartir (Open Graph)</label>
                <input
                  type="text"
                  value={seo.og_image_url}
                  onChange={(e) => setSeo({ ...seo, og_image_url: e.target.value })}
                  placeholder="https://estructurarte.co/image.png"
                />
                <p className="hint">Deja vacío para usar el favicon por defecto. Recomendado: 1200×630px.</p>
              </div>
            </div>
          )}

          {currentPanel === 'contact' && contact && (
            <div className="panel active">
              <div className="section-h"><h2>Contacto / CTAs</h2></div>
              <div className="card">
                <div className="card-title">
                  <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07"/></svg>
                  Datos de contacto
                </div>
                <div className="g2">
                  <div>
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      placeholder="+57 321 4502246"
                    />
                  </div>
                  <div>
                    <label>WhatsApp (número sin +)</label>
                    <input
                      type="text"
                      value={contact.whatsapp}
                      onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                      placeholder="573214502246"
                    />
                  </div>
                </div>
                <label>Email</label>
                <input
                  type="text"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  placeholder="contacto@estructurarte.co"
                />
                <label>Dirección / Ciudad</label>
                <input
                  type="text"
                  value={contact.address}
                  onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  placeholder="Pereira, Risaralda · Colombia"
                />
              </div>
            </div>
          )}

          {currentPanel === 'settings' && settings && (
            <div className="panel active">
              <div className="section-h"><h2>Personalización de Colores</h2></div>
              <div className="card">
                <div className="card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Paleta de Colores del Sitio Web
                </div>
                <div className="theme-grid">
                  <div>
                    <label>Color Principal (Acentos, Títulos Destacados)</label>
                    <div className="theme-color-input">
                      <input
                        type="color"
                        value={settings.primary_color}
                        onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                      />
                      <span className="theme-color-hex">{settings.primary_color.toUpperCase()}</span>
                    </div>
                  </div>
                  <div>
                    <label>Color Secundario (Fondo de Tarjetas, Elementos Metálicos)</label>
                    <div className="theme-color-input">
                      <input
                        type="color"
                        value={settings.secondary_color}
                        onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                      />
                      <span className="theme-color-hex">{settings.secondary_color.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <label style={{ marginTop: '1.5rem' }}>Preajustes Rápidos</label>
                <div className="theme-presets">
                  {[
                    { name: 'Dorado Industrial (Default)', primary: '#d4a853', secondary: '#1e2530' },
                    { name: 'Azul Acero Moderno', primary: '#4a9eff', secondary: '#162235' },
                    { name: 'Verde NSR-10 Eco', primary: '#3dd68c', secondary: '#12261e' },
                    { name: 'Naranja Obra Limpia', primary: '#e05c3a', secondary: '#241a16' }
                  ].map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSettings({ ...settings, primary_color: preset.primary, secondary_color: preset.secondary })}
                      className="theme-preset-btn"
                    >
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: preset.primary, display: 'inline-block' }}></span>
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmModal && confirmModal.isOpen && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-card">
            <h3>{confirmModal.title}</h3>
            <p>{confirmModal.message}</p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="confirm-btn-cancel"
                onClick={() => setConfirmModal(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="confirm-btn-danger"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="toast" id="toast">
        <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span id="toastMsg">Cambios guardados</span>
      </div>
    </div>
  );
}
