import React, { useContext, useState } from 'react';
import UserContext from '../context/users/UserContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import SetAuthToken from '../utils/SetAuthToken';

const SignUp = () => {
  const { signup, getUser, setUser, googleLogin } = useContext(UserContext);
  const [credential, setCredential] = useState({ email: "", password: "", name: "", cpassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [showCPass, setShowCPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const ochange = (e) => {
    setError("");
    setCredential({ ...credential, [e.target.name]: e.target.value });
  };

  const HandleSignup = async (e) => {
    e.preventDefault();
    setError("");
    const { name, email, password, cpassword } = credential;
    if (password !== cpassword) {
      setError("Passwords don't match. Please try again.");
      setCredential(p => ({ ...p, password: "", cpassword: "" }));
      return;
    }
    setLoading(true);
    try {
      await signup(name, email, password);
      localStorage.setItem("tempData", JSON.stringify({ email, from: "signup" }));
      navigate("/verify-otp");
    } catch (err) {
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    const { credential: googleCred } = credentialResponse;
    try {
      SetAuthToken(googleCred);
      const json = await googleLogin();
      localStorage.setItem("token", json.token);
      SetAuthToken(json.token);
      const userdata = await getUser();
      localStorage.setItem("user", JSON.stringify(userdata.user));
      setUser(userdata.user);
      navigate("/");
    } catch (err) {
      setError("Google sign up failed. Please try again.");
    }
  };

  const mismatch = credential.cpassword && credential.cpassword !== credential.password;
  const matched  = credential.cpassword && credential.cpassword === credential.password;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

        .su-page {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          overflow-y: auto;
          background: #f8faff;
        }

        /* ── Left panel ── */
        .su-left {
          width: 45%;
          flex-shrink: 0;
          background: linear-gradient(145deg, #7c3aed 0%, #4f46e5 55%, #2563eb 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 36px;
        }
        .su-left-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.15); }
        .su-left-content { position: relative; z-index: 2; color: #fff; max-width: 380px; }
        .su-left-logo { font-size: 52px; display: block; margin-bottom: 18px; }
        .su-left-heading { font-size: 1.9rem; font-weight: 800; line-height: 1.25; margin: 0 0 14px; }
        .su-left-sub { font-size: 0.95rem; color: rgba(255,255,255,0.82); line-height: 1.7; margin: 0 0 36px; }
        .su-features { display: flex; flex-direction: column; gap: 12px; }
        .su-feat {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 14px;
          padding: 13px 16px;
        }
        .su-feat-icon { font-size: 20px; }
        .su-feat-text { font-size: 0.88rem; font-weight: 500; }

        /* ── Right ── */
        .su-right {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 48px 24px;
          min-width: 0;
        }

        /* ── Card ── */
        .su-card {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(79,70,229,0.1);
          padding: 44px 38px;
          width: 100%;
          max-width: 460px;
          border: 1px solid #ede9fe;
          animation: fadeUp 0.35s ease both;
        }
        .su-header { text-align: center; margin-bottom: 28px; }
        .su-card-icon { font-size: 44px; display: block; margin-bottom: 12px; }
        .su-heading { font-size: 1.75rem; font-weight: 800; color: #1e1b4b; margin: 0 0 8px; }
        .su-subtext { font-size: 0.9rem; color: #6b7280; margin: 0; }

        /* ── Error ── */
        .su-error {
          background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
          border-radius: 10px; padding: 12px 16px; font-size: 0.875rem;
          margin-bottom: 18px; display: flex; align-items: center; gap: 8px;
        }

        /* ── Form ── */
        .su-form { display: flex; flex-direction: column; gap: 16px; }
        .su-field { display: flex; flex-direction: column; gap: 6px; }
        .su-label { font-size: 0.875rem; font-weight: 600; color: #374151; }
        .su-input {
          width: 100%; padding: 13px 16px;
          border: 2px solid #e5e7eb; border-radius: 12px;
          font-size: 0.95rem; color: #111827; background: #fafafa;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .su-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          background: #fff;
        }
        .su-input.error { border-color: #ef4444; }
        .su-input.ok    { border-color: #22c55e; }
        .su-pass-wrap { position: relative; }
        .su-pass-wrap .su-input { padding-right: 50px; }
        .su-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; font-size: 17px; padding: 4px; line-height: 1;
        }
        .su-hint-err { font-size: 0.8rem; color: #ef4444; margin: 4px 0 0; }
        .su-hint-ok  { font-size: 0.8rem; color: #22c55e; margin: 4px 0 0; }

        /* ── Submit ── */
        .su-submit {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; border: none; border-radius: 13px; padding: 15px;
          font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
          font-family: 'Inter', sans-serif;
          transition: opacity 0.2s, transform 0.15s;
          margin-top: 4px;
        }
        .su-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 26px rgba(124,58,237,0.45); }
        .su-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .su-spinner {
          width: 20px; height: 20px;
          border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.75s linear infinite; display: inline-block;
        }

        /* ── Divider / Google / Footer ── */
        .su-divider { display: flex; align-items: center; gap: 12px; margin: 22px 0; }
        .su-divider-line { flex: 1; height: 1px; background: #e5e7eb; }
        .su-divider-text { font-size: 0.8rem; color: #9ca3af; white-space: nowrap; }
        .su-google { display: flex; justify-content: center; margin-bottom: 18px; }
        .su-footer { text-align: center; font-size: 0.875rem; color: #6b7280; margin: 0; }
        .su-link { color: #6366f1; font-weight: 600; text-decoration: none; }
        .su-link:hover { text-decoration: underline; }

        /* ═══════════════ MOBILE ═══════════════ */
        @media (max-width: 768px) {
          .su-left { display: none !important; }
          .su-right { padding: 24px 16px; align-items: flex-start; padding-top: 40px; }
          .su-card { padding: 32px 22px; border-radius: 20px; }
          .su-heading { font-size: 1.5rem; }
        }
        @media (max-width: 400px) {
          .su-card { padding: 26px 16px; }
        }
      `}</style>

      <div className="su-page auth-page">
        {/* Left panel */}
        <div className="su-left">
          <div className="su-left-overlay" />
          <div className="su-left-content">
            <span className="su-left-logo">💬</span>
            <h2 className="su-left-heading">Join ChatWave today.</h2>
            <p className="su-left-sub">Start chatting with friends and family. Free, fast, and secure.</p>
            <div className="su-features">
              {[['⚡','Real-time messaging'],['📎','Send files & media'],['🔔','Instant notifications'],['🔒','End-to-end encrypted']]
                .map(([icon, text], i) => (
                  <div key={i} className="su-feat">
                    <span className="su-feat-icon">{icon}</span>
                    <span className="su-feat-text">{text}</span>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="su-right">
          <div className="su-card">
            <div className="su-header">
              <span className="su-card-icon">✨</span>
              <h1 className="su-heading">Create your account</h1>
              <p className="su-subtext">Join thousands of users on ChatWave</p>
            </div>

            {error && <div className="su-error"><span>⚠️</span>{error}</div>}

            <form onSubmit={HandleSignup} className="su-form">
              <div className="su-field">
                <label className="su-label" htmlFor="su-name">Username</label>
                <input id="su-name" className="su-input" type="text" name="name"
                  value={credential.name} onChange={ochange} placeholder="e.g. sachin123" minLength={3} required />
              </div>

              <div className="su-field">
                <label className="su-label" htmlFor="su-email">Email address</label>
                <input id="su-email" className="su-input" type="email" name="email"
                  value={credential.email} onChange={ochange} placeholder="you@example.com" required />
              </div>

              <div className="su-field">
                <label className="su-label" htmlFor="su-password">Password</label>
                <div className="su-pass-wrap">
                  <input id="su-password" className="su-input" type={showPass ? "text" : "password"}
                    name="password" value={credential.password} onChange={ochange}
                    placeholder="Min. 8 characters" minLength={8} autoComplete="off" required />
                  <button type="button" className="su-eye" onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="su-field">
                <label className="su-label" htmlFor="su-cpassword">Confirm Password</label>
                <div className="su-pass-wrap">
                  <input id="su-cpassword"
                    className={`su-input${mismatch ? ' error' : matched ? ' ok' : ''}`}
                    type={showCPass ? "text" : "password"} name="cpassword"
                    value={credential.cpassword} onChange={ochange}
                    placeholder="Repeat your password" minLength={8} autoComplete="off" required />
                  <button type="button" className="su-eye" onClick={() => setShowCPass(!showCPass)}>
                    {showCPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {mismatch && <p className="su-hint-err">Passwords do not match</p>}
                {matched  && <p className="su-hint-ok">✓ Passwords match</p>}
              </div>

              <button type="submit" className="su-submit" disabled={loading}>
                {loading ? <span className="su-spinner" /> : 'Create Account →'}
              </button>
            </form>

            <div className="su-divider">
              <div className="su-divider-line" />
              <span className="su-divider-text">or sign up with</span>
              <div className="su-divider-line" />
            </div>

            <div className="su-google">
              <GoogleLogin onSuccess={handleGoogleSignup}
                onError={() => setError("Google sign up failed.")} type="standard" locale="en" />
            </div>

            <p className="su-footer">
              Already have an account?{' '}
              <a href="/login" className="su-link">Sign in →</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;