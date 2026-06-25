import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useNavigate, NavLink } from "react-router";
import UserContext from '../context/users/UserContext';
import SetAuthToken from '../utils/SetAuthToken';
import { GoogleLogin } from '@react-oauth/google';
import {
  subscribeBackendStatus, getBackendStatus,
  isDevEnvironment
} from '../utils/backendStatus';
import axios from 'axios';
import { getDeviceInfo } from "../utils/userDeviceInfo";

const PING_URL = `${import.meta.env.VITE_URL || 'http://localhost:8000'}/api/auth/ping`;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
/** Returns true if the error is a network-level failure (server sleeping / offline) */
function isNetworkError(err) {
  return !err?.response; // no HTTP response → pure network error
}

const Login = () => {
  const navigate = useNavigate();
  const { login, getUser, setUser, googleLogin } = useContext(UserContext);
  const deviceInfo = getDeviceInfo();

  const [credential, setCredential] = useState({ email: '', password: '' });
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // ── Server-sleeping / offline inline state ────────────────────────────────
  // When a login attempt fails with a network error we enter "pending" mode:
  //  · pendingCreds  → credentials (or null for Google) to retry with
  //  · pendingGoogle → the raw Google credential string to retry with
  //  · serverMsg     → the message shown to the user while waiting
  const [pendingCreds, setPendingCreds]    = useState(null);   // { email, password } | null
  const [pendingGoogle, setPendingGoogle]  = useState(null);   // google cred string | null
  const [serverMsg, setServerMsg]          = useState('');     // non-empty → show banner
  const retryPollRef = useRef(null);

  // ── Core: do the actual login / redirect after server recovers ────────────
  const doLogin = useCallback(async (email, password) => {
    const json = await login(email, password, deviceInfo);
    if (!json.success) throw new Error(json.error || 'Login failed');
    localStorage.setItem('token', json.token);
    SetAuthToken(json.token);
    const userdata = await getUser();
    localStorage.setItem('user', JSON.stringify(userdata.user));
    setUser(userdata.user);
    navigate('/chats');
  }, [login, getUser, setUser, navigate]);

  const doGoogleLogin = useCallback(async (googleCred) => {
    SetAuthToken(googleCred);
    const json = await googleLogin(deviceInfo);
    localStorage.setItem('token', json.token);
    SetAuthToken(json.token);
    const userdata = await getUser();
    localStorage.setItem('user', JSON.stringify(userdata.user));
    setUser(userdata.user);
    navigate('/chats');
  }, [googleLogin, getUser, setUser, navigate]);

  // ── Cancel any pending retry (cleanup) ────────────────────────────────────
  const cancelPending = useCallback(() => {
    if (retryPollRef.current) {
      clearInterval(retryPollRef.current);
      retryPollRef.current = null;
    }
    setPendingCreds(null);
    setPendingGoogle(null);
    setServerMsg('');
  }, []);

  // ── Start polling for server recovery, then auto-retry login ─────────────
  const startRetryPolling = useCallback((creds, googleCred) => {
    if (retryPollRef.current) clearInterval(retryPollRef.current);

    const env = isDevEnvironment() ? 'dev' : 'prod';
    setServerMsg(
      env === 'prod'
        ? 'Server is waking up (free tier cold start). Your login will be retried automatically — usually takes 10–30 s.'
        : 'Backend is offline. Start the backend server and your login will be retried automatically.'
    );

    retryPollRef.current = setInterval(async () => {
      try {
        await axios.get(PING_URL, { timeout: 5000 });
        // ✅ Server is back — retry the login
        clearInterval(retryPollRef.current);
        retryPollRef.current = null;
        setServerMsg('✅ Server is back! Logging you in…');
        try {
          if (googleCred) {
            await doGoogleLogin(googleCred);
          } else {
            await doLogin(creds.email, creds.password);
          }
          // Success → navigate('/chats') already called inside doLogin/doGoogleLogin
        } catch (retryErr) {
          // Login itself failed (bad credentials, not a network error)
          cancelPending();
          setError(retryErr.message || 'Login failed after server recovery. Please try again.');
          setLoading(false);
        }
      } catch {
        // still offline — keep polling
      }
    }, 5000);
  }, [doLogin, doGoogleLogin, cancelPending]);

  // ── Cleanup poll on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => { if (retryPollRef.current) clearInterval(retryPollRef.current); };
  }, []);

  // ── Subscribe to backend status: if server recovers externally (StatusGate
  //    polling), also clear the pending state here ───────────────────────────
  useEffect(() => {
    const unsub = subscribeBackendStatus((status) => {
      if (status === 'online' && (pendingCreds || pendingGoogle)) {
        // StatusGate's poll already caught the recovery — our poll will also
        // catch it momentarily. Nothing extra needed here.
      }
    });
    return unsub;
  }, [pendingCreds, pendingGoogle]);

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (event) => {
    event.preventDefault();
    cancelPending();   // clear any previous pending state
    setLoading(true);
    setError('');
    const { email, password } = credential;
    try {
      await doLogin(email, password);
    } catch (err) {
      if (isNetworkError(err)) {
        // Server sleeping / offline — save credentials and poll
        setPendingCreds({ email, password });
        startRetryPolling({ email, password }, null);
        // Keep loading=true so the button stays disabled while polling
      } else {
        setError(err.message || 'Invalid credentials. Please try again.');
        setCredential(prev => ({ ...prev, password: '' }));
        setLoading(false);
      }
    }
  };

  // ── Google login ──────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    cancelPending();
    const { credential: googleCred } = credentialResponse;
    setLoading(true);
    setError('');
    try {
      await doGoogleLogin(googleCred);
    } catch (err) {
      if (isNetworkError(err)) {
        setPendingGoogle(googleCred);
        startRetryPolling(null, googleCred);
      } else {
        setError(err.message || 'Google login failed. Please try again.');
        setLoading(false);
      }
    }
  };

  const ochange = (e) => {
    cancelPending();   // user edits form → cancel any pending retry
    setError('');
    setCredential({ ...credential, [e.target.name]: e.target.value });
  };

  const isSleeping = !!serverMsg && !serverMsg.startsWith('✅');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .auth-page {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          overflow-y: auto;
          background: #f8faff;
        }

        /* ── Left panel ── */
        .auth-left {
          width: 50%;
          flex-shrink: 0;
          background: linear-gradient(145deg, #4338ca 0%, #6d28d9 55%, #9333ea 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }
        .auth-left-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.18);
        }
        .auth-left-content {
          position: relative;
          z-index: 2;
          color: #fff;
          max-width: 400px;
        }
        .auth-left-logo { font-size: 52px; display: block; margin-bottom: 20px; }
        .auth-left-heading {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1.25;
          margin: 0 0 14px;
        }
        .auth-left-sub {
          font-size: 1rem;
          color: rgba(255,255,255,0.8);
          line-height: 1.7;
          margin: 0 0 40px;
        }
        .auth-bubbles { display: flex; flex-direction: column; gap: 12px; }
        .auth-bubble {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 18px;
          padding: 13px 20px;
          font-size: 0.9rem;
          color: #fff;
          display: inline-block;
          align-self: flex-start;
        }
        .auth-bubble.right { align-self: flex-end; }

        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes floatC { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.45} }

        .float-a { animation: floatA 3s ease-in-out infinite; }
        .float-b { animation: floatB 3.5s ease-in-out infinite; }
        .float-c { animation: floatC 4s ease-in-out infinite; }

        /* ── Right panel ── */
        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          overflow-y: auto;
          min-width: 0;
        }

        /* ── Card ── */
        .auth-card {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(79,70,229,0.1);
          padding: 48px 40px;
          width: 100%;
          max-width: 440px;
          border: 1px solid #ede9fe;
          animation: fadeUp 0.35s ease both;
        }
        .auth-card-header { text-align: center; margin-bottom: 32px; }
        .auth-card-icon { font-size: 44px; display: block; margin-bottom: 12px; }
        .auth-heading {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1e1b4b;
          margin: 0 0 8px;
        }
        .auth-subtext { font-size: 0.9rem; color: #6b7280; margin: 0; }

        /* ── Error box ── */
        .auth-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 0.875rem;
          margin-bottom: 20px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        /* ── Server-sleeping banner ── */
        .auth-sleeping {
          background: #fffbeb;
          border: 1px solid #fcd34d;
          color: #92400e;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 0.85rem;
          margin-bottom: 20px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          line-height: 1.55;
        }
        .auth-sleeping.success {
          background: #f0fdf4;
          border-color: #86efac;
          color: #166534;
        }
        .auth-sleeping-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
        .auth-sleeping-dots span {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #d97706;
          margin: 0 2px;
          animation: pulse 1.2s ease-in-out infinite;
        }
        .auth-sleeping-dots span:nth-child(2) { animation-delay: 0.2s; }
        .auth-sleeping-dots span:nth-child(3) { animation-delay: 0.4s; }

        /* ── Cancel link ── */
        .auth-cancel {
          background: none;
          border: none;
          color: #6366f1;
          font-size: 0.8rem;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          margin-top: 4px;
          display: block;
          font-family: 'Inter', sans-serif;
        }

        /* ── Form ── */
        .auth-form { display: flex; flex-direction: column; gap: 20px; }
        .auth-field { display: flex; flex-direction: column; gap: 6px; }
        .auth-label { font-size: 0.875rem; font-weight: 600; color: #374151; }
        .auth-input {
          width: 100%;
          padding: 13px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #111827;
          background: #fafafa;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .auth-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          background: #fff;
        }
        .auth-pass-wrap { position: relative; }
        .auth-pass-wrap .auth-input { padding-right: 50px; }
        .auth-eye {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 17px;
          padding: 4px;
          line-height: 1;
        }

        /* ── Row ── */
        .auth-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        .auth-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: #4b5563;
          cursor: pointer;
        }
        .auth-remember input[type="checkbox"] { accentcolor: #6366f1; width: 16px; height: 16px; }
        .auth-link { color: #6366f1; font-size: 0.875rem; font-weight: 600; text-decoration: none; }
        .auth-link:hover { text-decoration: underline; }

        /* ── Submit ── */
        .auth-submit {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff;
          border: none;
          border-radius: 13px;
          padding: 15px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
          font-family: 'Inter', sans-serif;
          transition: opacity 0.2s, transform 0.15s;
        }
        .auth-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(99,102,241,0.45); }
        .auth-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .auth-spinner {
          width: 20px; height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
          display: inline-block;
        }

        /* ── Divider ── */
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }
        .auth-divider-line { flex: 1; height: 1px; background: #e5e7eb; }
        .auth-divider-text { font-size: 0.8rem; color: #9ca3af; white-space: nowrap; }

        /* ── Google ── */
        .auth-google { display: flex; justify-content: center; margin-bottom: 20px; }

        /* ── Footer ── */
        .auth-footer { text-align: center; font-size: 0.875rem; color: #6b7280; margin: 0; }

        /* ═══════════════════════════════════════
           MOBILE — hides left panel, full card
        ═══════════════════════════════════════ */
        @media (max-width: 768px) {
          .auth-left { display: none !important; }
          .auth-right {
            padding: 24px 16px;
            align-items: flex-start;
            padding-top: 40px;
          }
          .auth-card {
            padding: 36px 24px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(79,70,229,0.1);
          }
          .auth-heading { font-size: 1.5rem; }
        }
        @media (max-width: 400px) {
          .auth-card { padding: 28px 18px; }
          .auth-card-icon { font-size: 36px; }
        }
      `}</style>

      <div className="auth-page">
        {/* Left decorative panel */}
        <div className="auth-left">
          <div className="auth-left-overlay" />
          <div className="auth-left-content">
            <span className="auth-left-logo">💬</span>
            <h2 className="auth-left-heading">Connect with everyone, everywhere.</h2>
            <p className="auth-left-sub">Real-time messaging, file sharing, and more — all in one place.</p>
            <div className="auth-bubbles">
              <div className="auth-bubble float-a">Hey there! 👋</div>
              <div className="auth-bubble right float-b">Just sent you a file 📎</div>
              <div className="auth-bubble float-c">On my way! 🚀</div>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-card-header">
              <span className="auth-card-icon">👋</span>
              <h1 className="auth-heading">Welcome back</h1>
              <p className="auth-subtext">Sign in to your ChatWave account</p>
            </div>

            {/* ── Error banner ── */}
            {error && (
              <div className="auth-error"><span>⚠️</span>{error}</div>
            )}

            {/* ── Server sleeping / waking banner ── */}
            {serverMsg && (
              <div className={`auth-sleeping ${serverMsg.startsWith('✅') ? 'success' : ''}`}>
                <span className="auth-sleeping-icon">
                  {serverMsg.startsWith('✅') ? '✅' : '😴'}
                </span>
                <div>
                  <div>{serverMsg.startsWith('✅') ? serverMsg : serverMsg}</div>
                  {isSleeping && (
                    <>
                      <div className="auth-sleeping-dots" style={{ marginTop: 6 }}>
                        <span /><span /><span />
                      </div>
                      <button
                        type="button"
                        className="auth-cancel"
                        onClick={() => { cancelPending(); setLoading(false); }}
                      >
                        Cancel and edit credentials
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label className="auth-label" htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  className="auth-input"
                  type="email"
                  name="email"
                  value={credential.email}
                  onChange={ochange}
                  placeholder="you@example.com"
                  autoComplete="off"
                  required
                  disabled={isSleeping}
                />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="login-password">Password</label>
                <div className="auth-pass-wrap">
                  <input
                    id="login-password"
                    className="auth-input"
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={credential.password}
                    onChange={ochange}
                    placeholder="••••••••"
                    autoComplete="off"
                    required
                    disabled={isSleeping}
                  />
                  <button type="button" className="auth-eye" onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="auth-meta-row">
                <label className="auth-remember">
                  <input type="checkbox" />
                  Remember me
                </label>
                <NavLink to="/forget-password" className="auth-link">Forgot password?</NavLink>
              </div>

              <button
                type="submit"
                id="login-submit"
                className="auth-submit"
                disabled={loading || isSleeping}
              >
                {(loading || isSleeping)
                  ? <span className="auth-spinner" />
                  : 'Sign In →'
                }
              </button>
            </form>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">or continue with</span>
              <div className="auth-divider-line" />
            </div>

            <div className="auth-google">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed.')}
                type="standard"
                locale="en"
              />
            </div>

            <p className="auth-footer">
              Don't have an account?{' '}
              <a href="/signup" className="auth-link">Create one free →</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;