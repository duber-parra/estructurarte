import { useState, useEffect, useRef } from 'react';
import { supabase, Hero, Service, Engineer, FAQ, Image, Contact, SEO, Settings } from '../lib/supabase';
import { applyTheme } from '../lib/theme';
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
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
        'image/jpeg', quality
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

  const [hero, setHero] = useState<Hero | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [engineer, setEngineer] = useState<Engineer | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [seo, setSeo] = useState<SEO | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  useEffect(() => { loadData(); }, []);

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
    if (settingsRes.data) setSettings(settingsRes.data as Settings);
  }

  // ── Drag-and-drop ordering ─────────────────────────────────────
  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOver.current = index;
  }

  function handleDragEndServices() {
    if (dragItem.current === null || dragOver.current === null) return;
    const reordered = [...services];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOver.current, 0, moved);
    const updated = reordered.map((s, i) => ({ ...s, sort_order: i + 1 }));
    setServices(updated);
    dragItem.current = null;
    dragOver.current = null;
  }

  function handleDragEndFaqs() {
    if (dragItem.current === null || dragOver.current === null) return;
    const reordered = [...faqs];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOver.current, 0, moved);
    const updated = reordered.map((f, i) => ({ ...f, sort_order: i + 1 }));
    setFaqs(updated);
    dragItem.current = null;
    dragOver.current = null;
  }

  // ── Save all ───────────────────────────────────────────────────
  async function saveAll() {
    setSaving(true);
    const errors: string[] = [];

    if (hero) {
      const { error } = await supabase.from('cms_hero').update({
        eyebrow: hero.eyebrow, headline: hero.headline, sub: hero.sub,
        updated_at: new Date().toISOString()
      }).eq('id', hero.id);
      if (error) errors.push(`Hero: ${error.message}`);
    }

    if (engineer) {
      const { error } = await supabase.from('cms_engineer').update({
        name: engineer.name, role: engineer.role, bio: engineer.bio,
        photo_url: engineer.photo_url, updated_at: new Date().toISOString()
      }).eq('id', engineer.id);
      if (error) errors.push(`Ingeniero: ${error.message}`);
    }

    if (contact) {
      const { error } = await supabase.from('cms_contact').update({
        phone: contact.phone, whatsapp: contact.whatsapp,
        email: contact.email, address: contact.address,
        updated_at: new Date().toISOString()
      }).eq('id', contact.id);
      if (error) errors.push(`Contacto: ${error.message}`);
    }

    if (seo) {
      const { error } = await supabase.from('cms_seo').update({
        title: seo.title, description: seo.description,
        og_image_url: seo.og_image_url, updated_at: new Date().toISOString()
      }).eq('id', seo.id);
      if (error) errors.push(`SEO: ${error.message}`);
    }

    if (settings) {
      const { error } = await supabase.from('cms_settings').update({
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        bg_color: settings.bg_color,
        text_color: settings.text_color,
        updated_at: new Date().toISOString()
      }).eq('id', settings.id);
      if (error) errors.push(`Tema: ${error.message}`);
      else applyTheme(settings);
    }

    // Save all services (upsert name, tag, icon, description, sort_order)
    for (const svc of services) {
      const { error } = await supabase.from('cms_services').update({
        name: svc.name, tag: svc.tag, icon_key: svc.icon_key,
        description: svc.description, sort_order: svc.sort_order
      }).eq('id', svc.id);
      if (error) errors.push(`Servicio "${svc.name}": ${error.message}`);
    }

    // Save all FAQs (upsert question, answer, sort_order)
    for (const faq of faqs) {
      const { error } = await supabase.from('cms_faq').update({
        question: faq.question, answer: faq.answer, sort_order: faq.sort_order
      }).eq('id', faq.id);
      if (error) errors.push(`FAQ "${faq.question}": ${error.message}`);
    }

    setSaving(false);
    if (errors.length) {
      showToast(`\u26a0 ${errors[0]}`);
    } else {
      showToast('\u2713 Cambios guardados y publicados');
    }
  }

  // ── Images ─────────────────────────────────────────────────────
  async function deleteImage(id: string) {
    if (!confirm('¿Eliminar imagen?')) return;
    await supabase.from('cms_images').delete().eq('id', id);
    setImages(images.filter(img => img.id !== id));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newImages: Image[] = [];
    for (const file of files) {
      let blob: Blob;
      try { blob = await compressImage(file, 1920, 1080); }
      catch { showToast(`\u26a0 Error procesando ${file.name}`); continue; }
      const fileName = `${Math.random().toString(36).substring(2)}.jpg`;
      const { error: uploadError } = await supabase.storage.from('estructurarte-images').upload(fileName, blob, { contentType: 'image/jpeg' });
      if (uploadError) { showToast(`\u26a0 Storage: ${uploadError.message}`); continue; }
      const { data: urlData } = supabase.storage.from('estructurarte-images').getPublicUrl(fileName);
      const { data: newImage, error: insertError } = await supabase.from('cms_images').insert({
        image_url: urlData.publicUrl, caption: '', sort_order: images.length + newImages.length
      }).select().maybeSingle();
      if (insertError) { showToast(`\u26a0 DB: ${insertError.message}`); continue; }
      if (newImage) newImages.push(newImage);
    }
    if (newImages.length) setImages([...images, ...newImages]);
    showToast(newImages.length ? `\u2713 ${newImages.length} imagen(es) guardada(s)` : '\u26a0 No se guardó ninguna imagen');
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
    try { blob = await compressImage(file, 800, 800); }
    catch { showToast('\u26a0 Error procesando foto'); return; }
    const fileName = `engineer-${Math.random().toString(36).substring(2)}.jpg`;
    const { error: uploadError } = await supabase.storage.from('estructurarte-images').upload(fileName, blob, { contentType: 'image/jpeg' });
    if (uploadError) { showToast(`\u26a0 Storage: ${uploadError.message}`); return; }
    const { data: urlData } = supabase.storage.from('estructurarte-images').getPublicUrl(fileName);
    const newPhotoUrl = urlData.publicUrl;
    if (engineer) {
      const { error } = await supabase.from('cms_engineer').update({ photo_url: newPhotoUrl, updated_at: new Date().toISOString() }).eq('id', engineer.id);
      if (error) { showToast(`\u26a0 DB: ${error.message}`); return; }
      setEngineer({ ...engineer, photo_url: newPhotoUrl });
    }
    showToast('\u2713 Foto guardada');
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
    { id: 'hero', label: 'Hero / Portada', icon: <svg viewBox="0 0 24 24"><polyline points="23 7 13.5 15.5 8.5 10.5 1 17"/><polyline points="17 7 23 7 23 13"/></svg> },
    { id: 'engineer', label: 'Ingeniero', icon: <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id: 'services', label: 'Servicios', icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
    { id: 'faq', label: 'Preguntas FAQ', icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
    { id: 'gallery', label: 'Portafolio', icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  ];
  const settingsItems = [
    { id: 'theme', label: 'Tema / Colores', icon: <svg viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.52-4.48-9-10-9z"/></svg> },
    { id: 'contact', label: 'Contacto / CTAs', icon: <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07"/></svg> },
    { id: 'seo', label: 'SEO / Redes', icon: <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  ];

  return (
    <div className="admin-container">
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? 'mob-open' : ''}`}>
        <div className="sb-logo">
          <a href="#/">ESTRUC<span>T</span>URARTE</a>
          <div className="sb-badge">Panel Admin · CMS</div>
        </div>
        <nav className="sb-nav">
          <div className="sb-section">Contenido</div>
          {navItems.map(item => (
            <button key={item.id} className={`sb-item ${currentPanel === item.id ? 'active' : ''}`}
              onClick={() => { setCurrentPanel(item.id); setSidebarOpen(false); }}>
              {item.icon}{item.label}
            </button>
          ))}
          <div className="sb-section" style={{ marginTop: '.5rem' }}>Ajustes</div>
          {settingsItems.map(item => (
            <button key={item.id} className={`sb-item ${currentPanel === item.id ? 'active' : ''}`}
              onClick={() => { setCurrentPanel(item.id); setSidebarOpen(false); }}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>
        <div className="sb-bottom">
          <a href="#/" className="preview-btn">
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
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>

        <div className="content">

          {/* ── DASHBOARD ── */}
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
                  Edita cualquier sección desde el menú lateral y presiona <strong style={{ color: 'var(--accent)' }}>Guardar</strong> para publicar los cambios en el sitio.
                  En las secciones de servicios y preguntas, puedes <strong style={{ color: 'var(--accent)' }}>arrastrar</strong> para reordenar.
                </p>
              </div>
            </div>
          )}

          {/* ── HERO ── */}
          {currentPanel === 'hero' && hero && (
            <div className="panel active">
              <div className="section-h"><h2>Hero / Portada</h2></div>
              <div className="card">
                <div className="card-title">
                  <svg viewBox="0 0 24 24"><polyline points="23 7 13.5 15.5 8.5 10.5 1 17"/></svg>
                  Contenido principal
                </div>
                <label>Texto eyebrow (línea pequeña superior)</label>
                <input type="text" value={hero.eyebrow}
                  onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })}
                  placeholder="Ingeniería Estructural Metálica · Colombia · NSR-10" />
                <label>Titular (usar \n para saltos de línea)</label>
                <textarea rows={4} value={hero.headline}
                  onChange={(e) => setHero({ ...hero, headline: e.target.value })}
                  placeholder="CONSTRUYE\nEN LA MITAD\nDEL TIEMPO." />
                <p className="hint">La línea del medio aparece en dorado automáticamente.</p>
                <label>Subtítulo</label>
                <HtmlTextarea
                  value={hero.sub}
                  onChange={(v) => setHero({ ...hero, sub: v })}
                  rows={3}
                  placeholder="La ingeniería <strong>rápida y precisa</strong> que tu obra necesita."
                />
              </div>
            </div>
          )}

          {/* ── INGENIERO ── */}
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
                    <input type="text" value={engineer.name}
                      onChange={(e) => setEngineer({ ...engineer, name: e.target.value })}
                      placeholder="Ing. Juan Pérez" />
                  </div>
                  <div>
                    <label>Cargo / Rol</label>
                    <input type="text" value={engineer.role}
                      onChange={(e) => setEngineer({ ...engineer, role: e.target.value })}
                      placeholder="Ing. Civil · MSc Estructuras" />
                  </div>
                </div>
                <label>Biografía</label>
                <HtmlTextarea
                  value={engineer.bio}
                  onChange={(v) => setEngineer({ ...engineer, bio: v })}
                  rows={4}
                  placeholder="Más de 15 años diseñando estructuras metálicas..."
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
                      <button onClick={async () => {
                        await supabase.from('cms_engineer').update({ photo_url: '' }).eq('id', engineer.id);
                        setEngineer({ ...engineer, photo_url: '' });
                      }} style={{ position: 'absolute', top: '.3rem', right: '.3rem', background: 'rgba(0,0,0,.7)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', color: 'var(--danger)', fontSize: '.9rem' }}>×</button>
                    </div>
                  </div>
                )}
                <div className="upload-zone">
                  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <p><strong>Subir foto del ingeniero</strong></p>
                  <div className="file-input-wrap">
                    <input type="file" accept="image/*" onChange={handleEngineerPhoto} />
                    <div className="file-input-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      Elegir archivo
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SERVICIOS ── */}
          {currentPanel === 'services' && (
            <div className="panel active">
              <div className="section-h"><h2>Servicios</h2></div>
              <div className="drag-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                Arrastra desde el ícono <span>⠿</span> para cambiar el orden. Presiona Guardar para publicar.
              </div>
              <div className="card">
                <div className="card-title">
                  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  Servicios del sitio
                </div>
                <div className="drag-list">
                  {services.map((svc, idx) => (
                    <div
                      key={svc.id}
                      className="drag-card"
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragEnter={() => handleDragEnter(idx)}
                      onDragEnd={handleDragEndServices}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="drag-handle" title="Arrastrar para reordenar">⠿</div>
                      <div className="drag-card-body">
                        <div className="drag-card-num">{idx + 1}</div>
                        <div className="drag-card-fields">
                          <div className="g2">
                            <div>
                              <label>Nombre</label>
                              <input type="text" value={svc.name}
                                onChange={(e) => setServices(services.map(s => s.id === svc.id ? { ...s, name: e.target.value } : s))} />
                            </div>
                            <div>
                              <label>Etiqueta / Tag</label>
                              <input type="text" value={svc.tag}
                                onChange={(e) => setServices(services.map(s => s.id === svc.id ? { ...s, tag: e.target.value } : s))} />
                            </div>
                          </div>
                          <label>Ícono (grid, star, layers, home, file, clock)</label>
                          <input type="text" value={svc.icon_key}
                            onChange={(e) => setServices(services.map(s => s.id === svc.id ? { ...s, icon_key: e.target.value } : s))} />
                          <label>Descripción</label>
                          <textarea rows={3} value={svc.description}
                            onChange={(e) => setServices(services.map(s => s.id === svc.id ? { ...s, description: e.target.value } : s))} />
                        </div>
                        <button className="drag-delete" title="Eliminar"
                          onClick={async () => {
                            await supabase.from('cms_services').delete().eq('id', svc.id);
                            setServices(services.filter(s => s.id !== svc.id));
                          }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="add-btn" onClick={async () => {
                  const newOrder = services.length > 0 ? Math.max(...services.map(s => s.sort_order)) + 1 : 1;
                  const { data } = await supabase.from('cms_services').insert({
                    icon_key: 'clock', name: 'Nuevo servicio', tag: 'Etiqueta',
                    description: 'Descripción del servicio...', sort_order: newOrder
                  }).select().single();
                  if (data) setServices([...services, data]);
                }}>
                  <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Agregar servicio
                </button>
              </div>
            </div>
          )}

          {/* ── FAQ ── */}
          {currentPanel === 'faq' && (
            <div className="panel active">
              <div className="section-h"><h2>Preguntas FAQ</h2></div>
              <div className="drag-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                Arrastra desde el ícono <span>⠿</span> para cambiar el orden. Presiona Guardar para publicar.
              </div>
              <div className="card">
                <div className="card-title">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Preguntas frecuentes
                </div>
                <div className="drag-list">
                  {faqs.map((faq, idx) => (
                    <div
                      key={faq.id}
                      className="drag-card"
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragEnter={() => handleDragEnter(idx)}
                      onDragEnd={handleDragEndFaqs}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="drag-handle" title="Arrastrar para reordenar">⠿</div>
                      <div className="drag-card-body">
                        <div className="drag-card-num">{idx + 1}</div>
                        <div className="drag-card-fields">
                          <label>Pregunta</label>
                          <input type="text" value={faq.question}
                            onChange={(e) => setFaqs(faqs.map(f => f.id === faq.id ? { ...f, question: e.target.value } : f))} />
                          <label>Respuesta</label>
                          <HtmlTextarea
                            value={faq.answer}
                            onChange={(v) => setFaqs(faqs.map(f => f.id === faq.id ? { ...f, answer: v } : f))}
                            rows={3}
                            placeholder="Respuesta detallada..."
                          />
                        </div>
                        <button className="drag-delete" title="Eliminar"
                          onClick={async () => {
                            await supabase.from('cms_faq').delete().eq('id', faq.id);
                            setFaqs(faqs.filter(f => f.id !== faq.id));
                          }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="add-btn" onClick={async () => {
                  const newOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.sort_order)) + 1 : 1;
                  const { data } = await supabase.from('cms_faq').insert({
                    question: 'Nueva pregunta', answer: 'Respuesta...', sort_order: newOrder
                  }).select().single();
                  if (data) setFaqs([...faqs, data]);
                }}>
                  <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Agregar pregunta
                </button>
              </div>
            </div>
          )}

          {/* ── GALERÍA ── */}
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
                      <input className="img-caption-input" type="text" value={img.caption || ''}
                        placeholder="Pie de foto..." onChange={(e) => updateImageCaption(img.id, e.target.value)} />
                      <button className="del-img" onClick={() => deleteImage(img.id)}>×</button>
                    </div>
                  ))}
                </div>
                <div className="upload-zone">
                  <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p><strong>Subir imágenes</strong></p>
                  <div className="file-input-wrap">
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
                    <div className="file-input-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      Elegir imágenes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TEMA / COLORES ── */}
          {currentPanel === 'theme' && settings && (
            <div className="panel active">
              <div className="section-h"><h2>Tema / Colores</h2></div>

              <div className="theme-live-bar">
                <div className="theme-live-preview" style={{ '--p': settings.primary_color, '--s': settings.secondary_color, '--bg': settings.bg_color, '--tx': settings.text_color } as React.CSSProperties}>
                  <div className="tlp-bg">
                    <div className="tlp-nav">
                      <div className="tlp-logo">LOGO</div>
                      <div className="tlp-btn" style={{ background: settings.primary_color }}>CTA</div>
                    </div>
                    <div className="tlp-hero">
                      <div className="tlp-h1" style={{ color: settings.text_color }}>TÍTULO PRINCIPAL</div>
                      <div className="tlp-h2" style={{ color: settings.primary_color }}>COLOR PRIMARIO</div>
                      <div className="tlp-sub" style={{ color: settings.text_color + 'aa' }}>Subtítulo de ejemplo del sitio web</div>
                      <div className="tlp-chip" style={{ background: settings.secondary_color + '44', border: `1px solid ${settings.secondary_color}` }}>
                        <span style={{ color: settings.primary_color }}>●</span>
                        <span style={{ color: settings.text_color + 'cc' }}>color secundario</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="theme-live-label">Vista previa en tiempo real</div>
              </div>

              <div className="theme-grid">
                <ThemeColorCard
                  label="Color Primario"
                  desc="Acento principal — botones, títulos destacados, íconos activos"
                  value={settings.primary_color}
                  presets={['#d4a853', '#e07b54', '#54a0e0', '#3dd68c', '#e05486', '#b07cff', '#f0c040', '#ff6b35']}
                  onChange={(c) => { const next = { ...settings, primary_color: c }; setSettings(next); applyTheme(next); }}
                />
                <ThemeColorCard
                  label="Color Secundario"
                  desc="Fondos de tarjetas, secciones alternadas, elementos de apoyo"
                  value={settings.secondary_color}
                  presets={['#1e2530', '#2a1e30', '#1e2a24', '#1e2430', '#2e1e20', '#252525', '#1a2535', '#20282e']}
                  onChange={(c) => { const next = { ...settings, secondary_color: c }; setSettings(next); applyTheme(next); }}
                />
                <ThemeColorCard
                  label="Fondo de página"
                  desc="Color base del fondo. Recomendado: muy oscuro para el estilo actual"
                  value={settings.bg_color}
                  presets={['#0a0a0b', '#06070a', '#080c0b', '#0b0a08', '#070a10', '#101010', '#0d0d0f', '#08090d']}
                  onChange={(c) => { const next = { ...settings, bg_color: c }; setSettings(next); applyTheme(next); }}
                />
                <ThemeColorCard
                  label="Color de texto"
                  desc="Color del texto principal. Asegúrate que contraste con el fondo"
                  value={settings.text_color}
                  presets={['#e8e6e1', '#f0ede8', '#dde0e8', '#e4e8dd', '#eae8e0', '#f5f5f0', '#e0dbd5', '#dde4e8']}
                  onChange={(c) => { const next = { ...settings, text_color: c }; setSettings(next); applyTheme(next); }}
                />
              </div>

              <div className="theme-save-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                </svg>
                Los cambios se previsualzan al instante. Presiona <strong>Guardar</strong> en la barra superior para publicarlos en el sitio.
              </div>
            </div>
          )}

          {/* ── SEO ── */}
          {currentPanel === 'seo' && seo && (
            <div className="panel active">
              <div className="section-h"><h2>SEO / Redes Sociales</h2></div>
              <div className="card">
                <div className="card-title">
                  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Metadatos para buscadores y redes
                </div>
                <label>Título (meta / Open Graph)</label>
                <input type="text" value={seo.title}
                  onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                  placeholder="Estructurarte | Ingeniería Estructural Metálica · NSR-10" />
                <p className="hint">Aparece en la pestaña del navegador y como título al compartir por WhatsApp.</p>
                <label>Descripción (meta / Open Graph)</label>
                <textarea rows={4} value={seo.description}
                  onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                  placeholder="Ingeniería estructural metálica en Colombia..." />
                <p className="hint">Aparece como texto de vista previa al compartir por WhatsApp o redes sociales.</p>
                <label>URL de imagen para compartir (Open Graph)</label>
                <input type="text" value={seo.og_image_url}
                  onChange={(e) => setSeo({ ...seo, og_image_url: e.target.value })}
                  placeholder="https://estructurarte.co/image.png" />
                <p className="hint">Recomendado: 1200×630px.</p>
              </div>
            </div>
          )}

          {/* ── CONTACTO ── */}
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
                    <input type="tel" value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      placeholder="+57 321 4502246" />
                  </div>
                  <div>
                    <label>WhatsApp (número sin +)</label>
                    <input type="text" value={contact.whatsapp}
                      onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                      placeholder="573214502246" />
                  </div>
                </div>
                <label>Email</label>
                <input type="text" value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  placeholder="contacto@estructurarte.co" />
                <label>Dirección / Ciudad</label>
                <input type="text" value={contact.address}
                  onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  placeholder="Pereira, Risaralda · Colombia" />
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="toast" id="toast">
        <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span id="toastMsg">Cambios guardados</span>
      </div>
    </div>
  );
}

function ThemeColorCard({
  label, desc, value, presets, onChange,
}: {
  label: string;
  desc: string;
  value: string;
  presets: string[];
  onChange: (color: string) => void;
}) {
  return (
    <div className="theme-card">
      <div className="theme-card-head">
        <div className="theme-swatch" style={{ background: value }} />
        <div>
          <div className="theme-card-label">{label}</div>
          <div className="theme-card-desc">{desc}</div>
        </div>
      </div>
      <div className="theme-picker-row">
        <label className="theme-color-input">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="theme-color-hex">{value.toUpperCase()}</span>
        </label>
      </div>
      <div className="theme-presets">
        {presets.map((p) => (
          <button
            key={p}
            className={`theme-preset ${value.toLowerCase() === p.toLowerCase() ? 'active' : ''}`}
            style={{ background: p }}
            onClick={() => onChange(p)}
            title={p}
          />
        ))}
      </div>
    </div>
  );
}
