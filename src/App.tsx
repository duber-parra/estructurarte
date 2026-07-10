import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage';
import AdminPanel from './pages/AdminPanel';

const ADMIN_PIN = '2246';
const SESSION_KEY = 'ea_admin_auth';

function AdminLogin({ onAuth }: { onAuth: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onAuth();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 1500);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      fontFamily: "'Space Grotesk', 'Inter', sans-serif"
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#111',
        border: '1px solid #222',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        width: '320px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: '#666', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            ESTRUCTURARTE
          </div>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#444', textTransform: 'uppercase' }}>
            Panel de Administración
          </div>
        </div>
        <input
          type="password"
          value={pin}
          onChange={e => setPin(e.target.value)}
          placeholder="Clave de acceso"
          autoFocus
          style={{
            background: '#0a0a0a',
            border: `1px solid ${error ? '#c0392b' : '#2a2a2a'}`,
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            textAlign: 'center',
            letterSpacing: '0.2em',
            transition: 'border-color 0.2s'
          }}
        />
        {error && (
          <div style={{ fontSize: '0.75rem', color: '#c0392b', textAlign: 'center', letterSpacing: '0.05em' }}>
            Clave incorrecta
          </div>
        )}
        <button type="submit" style={{
          background: '#c9a84c',
          color: '#000',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem',
          fontSize: '0.75rem',
          fontWeight: '700',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: 'pointer'
        }}>
          Entrar
        </button>
      </form>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'admin'>('landing');
  const [adminAuth, setAdminAuth] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/admin') {
        setCurrentPage('admin');
        if (sessionStorage.getItem(SESSION_KEY) === '1') {
          setAdminAuth(true);
        }
      } else {
        setCurrentPage('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (currentPage === 'admin') {
    if (!adminAuth) return <AdminLogin onAuth={() => setAdminAuth(true)} />;
    return <AdminPanel />;
  }

  return <LandingPage />;
}

export default App;
