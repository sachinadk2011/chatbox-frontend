import { useEffect, useState, useRef } from 'react';
import { subscribeBackendStatus, markBackendOnline } from '../utils/backendStatus';
import { api } from '../utils/SetAuthToken';

/**
 * ServerWakingBanner
 *
 * Production-only overlay shown when Render's free-tier backend goes to sleep.
 * It does NOT redirect the user anywhere — it keeps them exactly where they are,
 * preserves their login session, and auto-retries in the background until the
 * server wakes up, then silently dismisses itself.
 *
 * The user sees a friendly animated modal with:
 *  - A progress ring that spins while retrying
 *  - A live countdown to the next retry attempt
 *  - A "Try Now" button for impatient users
 */
const PING_URL = '/api/auth/ping'; // lightweight health-check endpoint
const RETRY_INTERVAL_MS = 8000;   // retry every 8 seconds
const MAX_WAIT_MSG_SECONDS = 30;   // counter resets every 30 s for display

const ServerWakingBanner = () => {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(RETRY_INTERVAL_MS / 1000);
  const [attempt, setAttempt] = useState(0);
  const retryTimer = useRef(null);
  const countdownTimer = useRef(null);

  // ── Subscribe to backend status changes ────────────────────────────────────
  useEffect(() => {
    const unsub = subscribeBackendStatus((status) => {
      if (status === 'sleeping') {
        setVisible(true);
        startRetryLoop();
      } else if (status === 'online') {
        setVisible(false);
        clearTimers();
      }
    });
    return () => { unsub(); clearTimers(); };
  }, []);

  const clearTimers = () => {
    clearTimeout(retryTimer.current);
    clearInterval(countdownTimer.current);
  };

  const startRetryLoop = () => {
    clearTimers();

    // Countdown display
    setCountdown(RETRY_INTERVAL_MS / 1000);
    countdownTimer.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownTimer.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    // Schedule actual retry
    retryTimer.current = setTimeout(() => pingServer(), RETRY_INTERVAL_MS);
  };

  const pingServer = async () => {
    try {
      await api.get(PING_URL, { timeout: 5000 });
      // Server responded! Mark online and the subscription above will hide the banner.
      markBackendOnline();
    } catch {
      // Still sleeping — increment attempt counter and schedule next retry
      setAttempt((a) => a + 1);
      startRetryLoop();
    }
  };

  const handleTryNow = () => {
    clearTimers();
    setCountdown(0);
    pingServer();
  };

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeInBanner 0.3s ease',
      }}
    >
      <style>{`
        @keyframes fadeInBanner {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-dot {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40%            { transform: scale(1);   opacity: 1; }
        }
      `}</style>

      <div style={{
        background: 'white', borderRadius: '20px', padding: '40px 32px',
        maxWidth: '440px', width: '100%', textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
      }}>

        {/* ── Animated spinner ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ position: 'relative', width: '72px', height: '72px' }}>
            {/* Track ring */}
            <svg viewBox="0 0 72 72" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <circle cx="36" cy="36" r="30" fill="none" stroke="#fee2e2" strokeWidth="6" />
            </svg>
            {/* Spinning arc */}
            <svg viewBox="0 0 72 72" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              animation: 'spin 1.2s linear infinite',
            }}>
              <circle cx="36" cy="36" r="30" fill="none" stroke="#ef4444"
                strokeWidth="6" strokeDasharray="60 130" strokeLinecap="round" />
            </svg>
            {/* Server icon */}
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '26px',
            }}>
              🌐
            </div>
          </div>
        </div>

        {/* ── Heading ── */}
        <h2 style={{
          margin: '0 0 8px', fontSize: '20px', fontWeight: 800,
          color: '#0f172a', fontFamily: 'system-ui, sans-serif',
        }}>
          Server is Waking Up…
        </h2>

        {/* ── Subtext ── */}
        <p style={{
          margin: '0 0 24px', fontSize: '14px', color: '#64748b',
          lineHeight: 1.6, fontFamily: 'system-ui, sans-serif',
        }}>
          Our server is on a free hosting plan and goes to sleep after inactivity.
          It usually wakes up in <strong style={{ color: '#ef4444' }}>10–30 seconds</strong>.
          <br />Your session is safe and will resume automatically.
        </p>

        {/* ── Countdown / retry info ── */}
        <div style={{
          background: '#fef2f2', borderRadius: '10px', padding: '10px 16px',
          marginBottom: '20px', fontSize: '13px', color: '#991b1b',
          fontFamily: 'system-ui, sans-serif',
        }}>
          {countdown > 0
            ? `⏱ Retrying in ${countdown}s…`
            : '⏳ Contacting server…'}
          {attempt > 0 && (
            <span style={{ opacity: 0.7, marginLeft: '6px' }}>
              (Attempt {attempt + 1})
            </span>
          )}
        </div>

        {/* ── Bouncing dots — visual heartbeat ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: '#ef4444', display: 'inline-block',
              animation: `pulse-dot 1.4s ${i * 0.16}s ease-in-out infinite`,
            }} />
          ))}
        </div>

        {/* ── Try Now button ── */}
        <button
          onClick={handleTryNow}
          style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white', border: 'none', borderRadius: '12px',
            padding: '12px 28px', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            fontFamily: 'system-ui, sans-serif',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 18px rgba(239,68,68,0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 14px rgba(239,68,68,0.4)';
          }}
        >
          Try Now
        </button>

        <p style={{
          marginTop: '16px', fontSize: '11px', color: '#94a3b8',
          fontFamily: 'system-ui, sans-serif',
        }}>
          Your chats, friends, and data are waiting for you
        </p>
      </div>
    </div>
  );
};

export default ServerWakingBanner;
