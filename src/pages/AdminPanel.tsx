import { useState, useEffect } from 'react';
import { supabase, Hero, Service, Engineer, FAQ, Image, Contact, SEO } from '../lib/supabase';
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

  const [hero, setHero] = useState<Hero | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [engineer, setEngineer] = useState<Engineer | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [seo, setSeo] = useState<SEO | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [heroRes, servicesRes, engineerRes, faqsRes, imagesRes, contactRes, seoRes] = await Promise.all([
      supabase.from('cms_hero').select('*').maybeSingle(),
      supabase.from('cms_services').select('*').order('sort_order'),
      supabase.from('cms_engineer').select('*').maybeSingle(),
      supabase.from('cms_faq').select('*').order('sort_order'),
      supabase.from('cms_images').select('*').order('sort_order'),
      supabase.from('cms_contact').select('*').maybeSingle(),
      supabase.from('cms_seo').select('*').maybeSingle(),
    ]);

    if (heroRes.data) setHero(heroRes.data);
    if (servicesRes.data) setServices(servicesRes.data);
    if (engineerRes.data) setEngineer(engineerRes.data);
    if (faqsRes.data) setFaqs(faqsRes.data);
    if (imagesRes.data) setImages(imagesRes.data);
    if (contactRes.data) setContact(contactRes.data);
    if (seoRes.data) setSeo(seoRes.data);
  }

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

    setSaving(false);
    if (errors.length) {
      showToast(`⚠ ${errors[0]}`);
    } else {
      showToast('✓ Cambios guardados correctamente');
    }
  }

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
                <label>Subtítulo (acepta HTML: &lt;strong&gt;)</label>
                <textarea
                  rows={3}
                  value={hero.sub}
                  onChange={(e) => setHero({ ...hero, sub: e.target.value })}
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
                <label>Biografía (acepta HTML: &lt;strong&gt;)</label>
                <textarea
                  rows={4}
                  value={engineer.bio}
                  onChange={(e) => setEngineer({ ...engineer, bio: e.target.value })}
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
                <div className="upload-zone">
                  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <p><strong>Subir foto del ingeniero</strong></p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEngineerPhoto}
                    style={{ marginTop: '1rem' }}
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
                <div className="upload-zone">
                  <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p><strong>Subir imágenes</strong></p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ marginTop: '1rem' }}
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
                  Servicios del sitio
                </div>
                {services.map((svc) => (
                  <div key={svc.id} className="card" style={{ marginBottom: '1rem', borderLeft: '3px solid var(--accent)' }}>
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
                    <div className="g2" style={{ marginTop: '.5rem' }}>
                      <div>
                        <label>Orden</label>
                        <input
                          type="number"
                          value={svc.sort_order}
                          onChange={(e) => setServices(services.map(s => s.id === svc.id ? { ...s, sort_order: parseInt(e.target.value) || 0 } : s))}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '.5rem' }}>
                        <button
                          className="btn-sm"
                          onClick={async () => {
                            await supabase.from('cms_services').delete().eq('id', svc.id);
                            setServices(services.filter(s => s.id !== svc.id));
                          }}
                          style={{ background: 'var(--danger)', color: '#fff', border: 'none', padding: '.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '.75rem', whiteSpace: 'nowrap' }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
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
                  style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '.8rem' }}
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
                  Preguntas frecuentes
                </div>
                {faqs.map((faq) => (
                  <div key={faq.id} className="card" style={{ marginBottom: '1rem', borderLeft: '3px solid var(--accent)' }}>
                    <label>Pregunta</label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => setFaqs(faqs.map(f => f.id === faq.id ? { ...f, question: e.target.value } : f))}
                    />
                    <label>Respuesta (acepta HTML: &lt;strong&gt;)</label>
                    <textarea
                      rows={3}
                      value={faq.answer}
                      onChange={(e) => setFaqs(faqs.map(f => f.id === faq.id ? { ...f, answer: e.target.value } : f))}
                    />
                    <div className="g2" style={{ marginTop: '.5rem' }}>
                      <div>
                        <label>Orden</label>
                        <input
                          type="number"
                          value={faq.sort_order}
                          onChange={(e) => setFaqs(faqs.map(f => f.id === faq.id ? { ...f, sort_order: parseInt(e.target.value) || 0 } : f))}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '.5rem' }}>
                        <button
                          onClick={async () => {
                            await supabase.from('cms_faq').delete().eq('id', faq.id);
                            setFaqs(faqs.filter(f => f.id !== faq.id));
                          }}
                          style={{ background: 'var(--danger)', color: '#fff', border: 'none', padding: '.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '.75rem', whiteSpace: 'nowrap' }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={async () => {
                    const newOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.sort_order)) + 1 : 1;
                    const { data } = await supabase.from('cms_faq').insert({
                      question: 'Nueva pregunta',
                      answer: 'Respuesta...',
                      sort_order: newOrder
                    }).select().single();
                    if (data) setFaqs([...faqs, data].sort((a, b) => a.sort_order - b.sort_order));
                  }}
                  style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '.8rem' }}
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
        </div>
      </div>

      <div className="toast" id="toast">
        <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span id="toastMsg">Cambios guardados</span>
      </div>
    </div>
  );
}
