import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage';
import AdminPanel from './pages/AdminPanel';

const ADMIN_PIN = '2246';
const SESSION_KEY = 'ea_admin_auth';

const LOCKOUT_DELAYS = [30, 120, 600, 1800, 3600]; // in seconds (30s, 2m, 10m, 30m, 1h)

function AdminLogin({ onAuth }: { onAuth: () => void }) {
  const [pin, setPin] = useState('');
  const [numA, setNumA] = useState(0);
  const [numB, setNumB] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const [shake, setShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Lockout States from localStorage to prevent refresh bypass
  const [attempts, setAttempts] = useState(() => {
    return Number(localStorage.getItem('ea_auth_attempts') || '0');
  });
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(() => {
    const val = localStorage.getItem('ea_auth_lockout_end');
    return val ? Number(val) : null;
  });
  const [lockoutCount, setLockoutCount] = useState(() => {
    return Number(localStorage.getItem('ea_auth_lockout_count') || '0');
  });
  const [timeLeft, setTimeLeft] = useState(0);

  function generateCaptcha() {
    setNumA(Math.floor(Math.random() * 8) + 2); // 2 to 9
    setNumB(Math.floor(Math.random() * 8) + 2); // 2 to 9
    setCaptchaInput('');
  }

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ea_auth_attempts', attempts.toString());
  }, [attempts]);

  useEffect(() => {
    if (lockoutEnd) {
      localStorage.setItem('ea_auth_lockout_end', lockoutEnd.toString());
    } else {
      localStorage.removeItem('ea_auth_lockout_end');
    }
  }, [lockoutEnd]);

  useEffect(() => {
    localStorage.setItem('ea_auth_lockout_count', lockoutCount.toString());
  }, [lockoutCount]);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutEnd) return;
    
    const checkLockout = () => {
      const diff = Math.ceil((lockoutEnd - Date.now()) / 1000);
      if (diff <= 0) {
        setLockoutEnd(null);
        setTimeLeft(0);
        setAttempts(0);
        generateCaptcha();
      } else {
        setTimeLeft(diff);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockoutEnd]);

  function handleFailure(msg: string) {
    setShake(true);
    setTimeout(() => setShake(false), 500);
    setPin('');
    generateCaptcha();
    setErrorMessage(msg);

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (nextAttempts >= 5) {
      const delayIdx = Math.min(lockoutCount, LOCKOUT_DELAYS.length - 1);
      const delay = LOCKOUT_DELAYS[delayIdx] * 1000;
      setLockoutEnd(Date.now() + delay);
      setLockoutCount(prev => prev + 1);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lockoutEnd && Date.now() < lockoutEnd) return;

    // Validate Math Captcha
    if (parseInt(captchaInput) !== (numA + numB)) {
      handleFailure('Fallo anti-bot: Captcha incorrecto');
      return;
    }

    // Validate PIN
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAttempts(0);
      setLockoutCount(0);
      setLockoutEnd(null);
      localStorage.removeItem('ea_auth_attempts');
      localStorage.removeItem('ea_auth_lockout_count');
      localStorage.removeItem('ea_auth_lockout_end');
      onAuth();
    } else {
      handleFailure('Clave incorrecta');
    }
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${sec}s`;
  }

  const isLocked = !!(lockoutEnd && timeLeft > 0);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      fontFamily: "'Space Mono', 'DM Sans', sans-serif"
    }}>
      <form
        onSubmit={handleSubmit}
        className={shake ? 'shake' : ''}
        style={{
          background: '#111114',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          width: '340px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: '#d4a853', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            ESTRUCTURARTE
          </div>
          <div style={{ fontSize: '0.62rem', letterSpacing: '0.12em', color: '#666', textTransform: 'uppercase' }}>
            Panel de Administración
          </div>
        </div>

        {/* Pin Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.65rem', color: '#7a7870', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Clave de Acceso</label>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="••••"
            disabled={isLocked}
            autoFocus
            style={{
              background: '#0a0a0b',
              border: `1px solid ${errorMessage ? '#e05c3a' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none',
              textAlign: 'center',
              letterSpacing: '0.25em',
              transition: 'border-color 0.2s'
            }}
          />
        </div>

        {/* Anti-Bot Captcha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.65rem', color: '#7a7870', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Filtro Anti-Bot</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              background: '#0a0a0b',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '8px',
              padding: '0.65rem',
              color: '#d4a853',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              fontFamily: "'Space Mono', monospace",
              flex: 1.2,
              textAlign: 'center',
              userSelect: 'none'
            }}>
              {numA} + {numB} =
            </div>
            <input
              type="number"
              value={captchaInput}
              onChange={e => setCaptchaInput(e.target.value)}
              disabled={isLocked}
              placeholder="?"
              style={{
                flex: 1,
                background: '#0a0a0b',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '8px',
                padding: '0.65rem',
                color: '#fff',
                fontSize: '0.9rem',
                textAlign: 'center',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={generateCaptcha}
              disabled={isLocked}
              style={{
                background: 'none',
                border: 'none',
                color: '#555',
                cursor: 'pointer',
                fontSize: '1.1rem',
                padding: '0.2rem'
              }}
            >
              ↻
            </button>
          </div>
        </div>

        {/* Attempts Dots */}
        {!isLocked && (
          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', margin: '0.1rem 0' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: i < attempts ? '#e05c3a' : 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(0,0,0,0.5)',
                  transition: 'background 0.3s'
                }}
              />
            ))}
          </div>
        )}

        {/* Error message or Lockout warning */}
        {errorMessage && !isLocked && (
          <div style={{ fontSize: '0.72rem', color: '#e05c3a', textAlign: 'center', letterSpacing: '0.02em', fontWeight: '500' }}>
            {errorMessage}
          </div>
        )}

        {isLocked && (
          <div style={{ color: '#e05c3a', fontSize: '0.72rem', textAlign: 'center', lineHeight: '1.5', background: 'rgba(224,92,58,0.05)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(224,92,58,0.15)' }}>
            Límite de intentos superado.<br />
            Espera: <strong>{formatTime(timeLeft)}</strong>
          </div>
        )}

        <button
          type="submit"
          disabled={isLocked}
          style={{
            background: isLocked ? '#222' : '#d4a853',
            color: isLocked ? '#555' : '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem',
            fontSize: '0.75rem',
            fontWeight: '700',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: isLocked ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
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
