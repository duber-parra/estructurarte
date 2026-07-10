import { useState } from 'react';

export default function Navigation() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
    document.body.style.overflow = !isDrawerOpen ? 'hidden' : '';
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
        <a href="#services" onClick={closeDrawer}>Servicios</a>
        <a href="#diferencial" onClick={closeDrawer}>Diferencial</a>
        <a href="#confianza" onClick={closeDrawer}>Confianza</a>
        <a href="#faq" onClick={closeDrawer}>FAQ</a>
        <a href="#cta-final" className="dcta rh" onClick={closeDrawer}>Agendar Cita</a>
      </div>

      <nav className="top">
        <a href="#" className="logo">ESTRUC<span>T</span>URARTE</a>
        <ul className="nav-links">
          <li><a href="#services">Servicios</a></li>
          <li><a href="#diferencial">Diferencial</a></li>
          <li><a href="#confianza">Confianza</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#cta-final" className="nav-cta">Agendar Cita</a></li>
        </ul>
        <button className={`hamburger ${isDrawerOpen ? 'open' : ''}`} onClick={toggleDrawer}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </>
  );
}
