import { useEffect, useState, useRef, useCallback } from 'react';
import LandingPage from './pages/LandingPage';
import AdminPanel from './pages/AdminPanel';

const ADMIN_PIN = '2246';
const SESSION_KEY = 'ea_admin_auth';
const ATTEMPTS_KEY = 'ea_admin_attempts';
const LOCKOUT_KEY = 'ea_admin_lockout';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATIONS = [30, 120, 600, 1800, 3600]; // seconds: 30s, 2m, 10m, 30m, 1h

interface Challenge {
  a: number;
  b: number;
  answer: number;
}

function generateChallenge(): Challenge {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 1;
  return { a, b, answer: a + b };
}

function getRemainingLockout(): number {
  const until = Number(localStorage.getItem(LOCKOUT_KEY) || '0');
  const remaining = Math.ceil((until - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

function formatTime(seconds: number): string {
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function AdminLogin({ onAuth }: { onAuth: () => void }) {
  const [pin, setPin] = useState('');
  const [challenge, setChallenge] = useState<Challenge>(() => generateChallenge());
  const [challengeInput, setChallengeInput] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(() => Number(localStorage.getItem(ATTEMPTS_KEY) || '0'));
  const [lockoutRemaining, setLockoutRemaining] = useState(() => getRemainingLockout());
  const [shakeKey, setShakeKey] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearLockout = useCallback(() => {
    localStorage.removeItem(LOCKOUT_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
    setAttempts(0);
    setLockoutRemaining(0);
  }, []);

  useEffect(() => {
    if (lockoutRemaining <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      const remaining = getRemainingLockout();
      setLockoutRemaining(remaining);
      if (remaining <= 0) clearLockout();
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [lockoutRemaining, clearLockout]);

  function recordFailure() {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    localStorage.setItem(ATTEMPTS_KEY, String(nextAttempts));

    if (nextAttempts >= MAX_ATTEMPTS) {
      const lockIndex = Math.min(nextAttempts - MAX_ATTEMPTS, LOCKOUT_DURATIONS.length - 1);
      const duration = LOCKOUT_DURATIONS[lockIndex] * 1000;
      const until = Date.now() + duration;
      localStorage.setItem(LOCKOUT_KEY, String(until));
      setLockoutRemaining(Math.ceil(duration / 1000));
      setPin('');
      setChallengeInput('');
      setChallenge(generateChallenge());
    } else {
      setPin('');
      setChallengeInput('');
      setChallenge(generateChallenge());
      setShakeKey(k => k + 1);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    if (Number(challengeInput) !== challenge.answer) {
      setError('Verificación anti-bot incorrecta');
      recordFailure();
      return;
    }

    if (pin !== ADMIN_PIN) {
      setError('Clave incorrecta');
      recordFailure();
      return;
    }

    sessionStorage.setItem(SESSION_KEY, '1');
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
    onAuth();
  }

  const isLocked = lockoutRemaining > 0;
  const attemptsLeft = MAX_ATTEMPTS - attempts;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      padding: '1rem',
    }}>
      <form
        onSubmit={handleSubmit}
        key={shakeKey}
        style={{
          background: '#111',
          border: `1px solid ${isLocked ? '#c0392b44' : error ? '#c0392b44' : '#222'}`,
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem',
          width: '340px',
          maxWidth: '100%',
          animation: error && !isLocked ? 'shake 0.4s ease' : 'none',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: '#666', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            ESTRUCTURARTE
          </div>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#444', textTransform: 'uppercase' }}>
            Panel de Administración
          </div>
        </div>

        {/* Anti-bot challenge */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.62rem',
            letterSpacing: '0.12em',
            color: '#555',
            textTransform: 'uppercase',
            marginBottom: '0.4rem',
            fontFamily: "'Space Mono', monospace",
          }}>
            Verificación anti-bot
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: '#0a0a0a',
            border: `1px solid ${error === 'Verificación anti-bot incorrecta' ? '#c0392b' : '#2a2a2a'}`,
            borderRadius: '8px',
            padding: '0.6rem 0.8rem',
          }}>
            <span style={{
              fontSize: '0.85rem',
              color: '#888',
              fontFamily: "'Space Mono', monospace",
              whiteSpace: 'nowrap',
              flex: '0 0 auto',
            }}>
              {challenge.a} + {challenge.b} =
            </span>
            <input
              type="number"
              value={challengeInput}
              onChange={e => setChallengeInput(e.target.value)}
              placeholder="?"
              disabled={isLocked}
              autoFocus={!isLocked}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                width: '100%',
                fontFamily: "'Space Mono', monospace",
              }}
            />
            <button
              type="button"
              onClick={() => setChallenge(generateChallenge())}
              disabled={isLocked}
              title="Nuevo reto"
              style={{
                background: 'none',
                border: 'none',
                color: '#444',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                padding: '2px',
                display: 'flex',
                flex: '0 0 auto',
                opacity: isLocked ? 0.4 : 1,
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0115-6.7L21 8"/>
                <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 01-15 6.7L3 16"/>
              </svg>
            </button>
          </div>
        </div>

        {/* PIN input */}
        <div>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="Clave de acceso"
            disabled={isLocked}
            style={{
              background: '#0a0a0a',
              border: `1px solid ${error === 'Clave incorrecta' ? '#c0392b' : '#2a2a2a'}`,
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none',
              textAlign: 'center',
              letterSpacing: '0.2em',
              transition: 'border-color 0.2s',
              width: '100%',
              boxSizing: 'border-box',
              opacity: isLocked ? 0.4 : 1,
            }}
          />
        </div>

        {/* Error / lockout messages */}
        {error && !isLocked && (
          <div style={{
            fontSize: '0.72rem',
            color: '#c0392b',
            textAlign: 'center',
            letterSpacing: '0.03em',
            fontFamily: "'Space Mono', monospace",
          }}>
            {error}{attemptsLeft < MAX_ATTEMPTS && attemptsLeft > 0 ? ` · ${attemptsLeft} intento${attemptsLeft !== 1 ? 's' : ''} restante${attemptsLeft !== 1 ? 's' : ''}` : ''}
          </div>
        )}

        {isLocked && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.8rem',
            background: '#c0392b11',
            border: '1px solid #c0392b33',
            borderRadius: '8px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.72rem',
              color: '#c0392b',
              letterSpacing: '0.05em',
              fontFamily: "'Space Mono', monospace",
            }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Acceso bloqueado
            </div>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: '#e8e6e1',
              fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.05em',
            }}>
              {formatTime(lockoutRemaining)}
            </div>
            <div style={{
              fontSize: '0.62rem',
              color: '#555',
              letterSpacing: '0.03em',
              textAlign: 'center',
            }}>
              Demasiados intentos fallidos. Espera para volver a intentar.
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLocked}
          style={{
            background: isLocked ? '#333' : '#c9a84c',
            color: isLocked ? '#666' : '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem',
            fontSize: '0.75rem',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: isLocked ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isLocked ? 'Bloqueado' : 'Entrar'}
        </button>

        {/* Attempt indicator dots */}
        {!isLocked && attempts > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '-0.25rem',
          }}>
            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
              <div key={i} style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: i < attempts ? '#c0392b' : '#2a2a2a',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>
        )}
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
