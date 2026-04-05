import { useContext, useState } from 'react';
import UserContext from '../context/users/UserContext';
import { useNavigate } from "react-router-dom";

const SetPassword = () => {
  const { setPassword } = useContext(UserContext);
  let navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const email = JSON.parse(localStorage.getItem("tempData"))?.email || "";

  const checks = [
    { icon: '📏', label: 'At least 8 characters',        pass: newPassword.length >= 8 },
    { icon: '🔠', label: 'At least 1 uppercase (A–Z)',    pass: /[A-Z]/.test(newPassword) },
    { icon: '🔡', label: 'At least 1 lowercase (a–z)',    pass: /[a-z]/.test(newPassword) },
    { icon: '🔢', label: 'At least 1 number (0–9)',       pass: /[0-9]/.test(newPassword) },
    { icon: '💠', label: 'At least 1 symbol ($, @, &…)', pass: /[^A-Za-z0-9]/.test(newPassword) },
  ];
  const strength = checks.filter(c => c.pass).length;
  const strengthMeta = [
    { label: 'Very Weak', color: '#ef4444', bg: '#fef2f2' },
    { label: 'Weak',      color: '#f97316', bg: '#fff7ed' },
    { label: 'Fair',      color: '#eab308', bg: '#fefce8' },
    { label: 'Good',      color: '#84cc16', bg: '#f7fee7' },
    { label: 'Strong',    color: '#22c55e', bg: '#f0fdf4' },
  ];

  const mismatch = confirmPassword && confirmPassword !== newPassword;
  const matched  = confirmPassword && confirmPassword === newPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages([]);
    if (newPassword !== confirmPassword) {
      setErrorMessages(["Passwords do not match."]);
      return;
    }
    setLoading(true);
    try {
      await setPassword(email, newPassword);
      setDone(true);
      setTimeout(() => navigate("/login"), 2200);
    } catch (error) {
      if (Array.isArray(error.errors)) setErrorMessages(error.errors);
      else if (error.msg) setErrorMessages([error.msg]);
      else setErrorMessages(["Something went wrong. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounceIn{ 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }

        .sp-page {
          min-height: 100vh;
          background: linear-gradient(145deg, #eef2ff 0%, #faf5ff 50%, #eef2ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          font-family: 'Inter', sans-serif;
          overflow-y: auto;
        }

        .sp-card {
          background: #fff;
          border-radius: 28px;
          box-shadow: 0 24px 80px rgba(99,102,241,0.13);
          padding: 52px 44px;
          width: 100%;
          max-width: 480px;
          border: 1px solid #ede9fe;
          text-align: center;
          animation: fadeUp 0.4s ease both;
        }

        /* ── Success state ── */
        .sp-success-icon {
          font-size: 72px;
          animation: bounceIn 0.6s cubic-bezier(0.36,0.07,0.19,0.97) both;
          display: block; margin-bottom: 20px;
        }
        .sp-success-heading { font-size: 1.8rem; font-weight: 800; color: #16a34a; margin: 0 0 10px; }
        .sp-success-sub { color: #6b7280; font-size: 0.95rem; }

        /* ── Icon ── */
        .sp-icon-wrap { display: flex; justify-content: center; margin-bottom: 28px; }
        .sp-icon-ring {
          width: 88px; height: 88px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 32px rgba(99,102,241,0.35);
          font-size: 40px;
          animation: pulse 3s ease-in-out infinite;
        }

        .sp-heading { font-size: 1.75rem; font-weight: 800; color: #1e1b4b; margin: 0 0 10px; }
        .sp-subtext { font-size: 0.9rem; color: #6b7280; line-height: 1.7; margin: 0 0 30px; }
        .sp-email-tag {
          display: inline-block;
          background: #eef2ff; color: #4338ca;
          border-radius: 8px; padding: 4px 10px;
          font-size: 0.85rem; font-weight: 700;
        }

        /* ── Errors ── */
        .sp-errors {
          background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
          border-radius: 10px; padding: 12px 16px; font-size: 0.875rem;
          margin-bottom: 20px; text-align: left;
          display: flex; flex-direction: column; gap: 4px;
        }
        .sp-err-row { display: flex; align-items: center; gap: 6px; }

        /* ── Form ── */
        .sp-form { display: flex; flex-direction: column; gap: 20px; text-align: left; }
        .sp-field { display: flex; flex-direction: column; gap: 6px; }
        .sp-label { font-size: 0.875rem; font-weight: 600; color: #374151; }
        .sp-input {
          width: 100%; padding: 13px 16px;
          border: 2px solid #e5e7eb; border-radius: 12px;
          font-size: 0.95rem; color: #111827; background: #fafafa;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .sp-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          background: #fff;
        }
        .sp-input.error  { border-color: #ef4444; }
        .sp-input.ok     { border-color: #22c55e; }
        .sp-pass-wrap    { position: relative; }
        .sp-pass-wrap .sp-input { padding-right: 50px; }
        .sp-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; font-size: 17px; padding: 4px; line-height: 1;
        }
        .sp-hint-err { font-size: 0.8rem; color: #ef4444; margin: 4px 0 0; }
        .sp-hint-ok  { font-size: 0.8rem; color: #22c55e; margin: 4px 0 0; }

        /* ── Hide browser's native password eye ── */
        .sp-input[type="password"]::-ms-reveal,
        .sp-input[type="password"]::-ms-clear { display: none !important; }
        .sp-input::-webkit-credentials-auto-fill-button { display: none !important; }
        .sp-input[type="password"]::-webkit-textfield-decoration-container { display: none !important; }

        /* ── Strength bar ── */
        .sp-strength-wrap { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
        .sp-strength-bar  { display: flex; gap: 4px; flex: 1; }
        .sp-strength-seg  { flex: 1; height: 5px; border-radius: 5px; transition: background 0.35s; }
        .sp-strength-badge {
          font-size: 0.73rem; font-weight: 700;
          padding: 2px 10px; border-radius: 20px;
          white-space: nowrap; transition: all 0.3s;
        }

        /* ── Checklist ── */
        .sp-checklist {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 12px;
        }
        .sp-check-item { display: flex; align-items: center; gap: 7px; }
        .sp-check-icon {
          width: 22px; height: 22px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; flex-shrink: 0;
          transition: all 0.25s;
        }
        .sp-check-icon.pass  { background: #dcfce7; color: #16a34a; }
        .sp-check-icon.fail  { background: #f1f5f9; color: #cbd5e1; }
        .sp-check-emoji { font-size: 14px; flex-shrink: 0; }
        .sp-check-text { font-size: 0.78rem; transition: color 0.25s; line-height: 1.3; }
        .sp-check-text.pass { color: #374151; font-weight: 500; }
        .sp-check-text.fail { color: #9ca3af; }

        @media (max-width: 420px) {
          .sp-checklist { grid-template-columns: 1fr; }
        }

        /* ── Submit ── */
        .sp-submit {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff; border: none; border-radius: 13px; padding: 15px;
          font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(99,102,241,0.4);
          font-family: 'Inter', sans-serif;
          transition: opacity 0.2s, transform 0.15s;
          margin-top: 6px;
        }
        .sp-submit:hover:not(:disabled) { transform: translateY(-1px); }
        .sp-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .sp-spinner {
          width: 20px; height: 20px;
          border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.75s linear infinite; display: inline-block;
        }

        /* ── Back ── */
        .sp-back { border-top: 1px solid #f3f4f6; padding-top: 20px; margin-top: 24px; }
        .sp-back a { color: #9ca3af; font-size: 0.875rem; text-decoration: none; font-weight: 500; }
        .sp-back a:hover { color: #6366f1; }

        /* ═══════════════ MOBILE ═══════════════ */
        @media (max-width: 520px) {
          .sp-card { padding: 36px 22px; border-radius: 22px; }
          .sp-heading { font-size: 1.5rem; }
          .sp-icon-ring { width: 74px; height: 74px; font-size: 34px; }
        }
        @media (max-width: 380px) {
          .sp-card { padding: 28px 16px; }
        }
      `}</style>

      <div className="sp-page auth-page">
        <div className="sp-card">

          {/* ── Success screen ── */}
          {done ? (
            <>
              <span className="sp-success-icon">🎉</span>
              <h1 className="sp-success-heading">Password Updated!</h1>
              <p className="sp-success-sub">Redirecting you to login…</p>
            </>
          ) : (
            <>
              {/* Icon */}
              <div className="sp-icon-wrap">
                <div className="sp-icon-ring">🔐</div>
              </div>

              <h1 className="sp-heading">Set New Password</h1>
              <p className="sp-subtext">
                Create a strong password for{' '}
                {email && <span className="sp-email-tag">
                  {email.split("@")[0].slice(0, 3)}***@{email.split("@")[1]}
                </span>}
              </p>

              {/* Errors */}
              {errorMessages.length > 0 && (
                <div className="sp-errors">
                  {errorMessages.map((m, i) => (
                    <div key={i} className="sp-err-row"><span>⚠️</span>{m}</div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="sp-form">
                {/* New password */}
                <div className="sp-field">
                  <label className="sp-label" htmlFor="sp-new">New Password</label>
                  <div className="sp-pass-wrap">
                    <input id="sp-new" className="sp-input" type={showNew ? "text" : "password"}
                      value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters" required minLength={8} />
                    <button type="button" className="sp-eye" onClick={() => setShowNew(!showNew)}>
                      {showNew ? '🙈' : '👁️'}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {newPassword.length > 0 && (
                    <div className="sp-strength-wrap">
                      <div className="sp-strength-bar">
                        {[0,1,2,3,4].map(i => (
                          <div key={i} className="sp-strength-seg" style={{
                            background: i < strength ? strengthMeta[Math.min(strength-1, 4)]?.color : '#e5e7eb'
                          }} />
                        ))}
                      </div>
                      {strength > 0 && (
                        <span className="sp-strength-badge" style={{
                          color: strengthMeta[Math.min(strength-1,4)].color,
                          background: strengthMeta[Math.min(strength-1,4)].bg,
                        }}>
                          {strengthMeta[Math.min(strength-1,4)].label}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Checklist — 2-column grid */}
                  <div className="sp-checklist">
                    {checks.map((c, i) => (
                      <div key={i} className="sp-check-item">
                        <div className={`sp-check-icon ${c.pass ? 'pass' : 'fail'}`}>
                          {c.pass ? '✓' : '·'}
                        </div>
                        <span className="sp-check-emoji">{c.icon}</span>
                        <span className={`sp-check-text ${c.pass ? 'pass' : 'fail'}`}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm password */}
                <div className="sp-field">
                  <label className="sp-label" htmlFor="sp-confirm">Confirm Password</label>
                  <div className="sp-pass-wrap">
                    <input id="sp-confirm"
                      className={`sp-input${mismatch ? ' error' : matched ? ' ok' : ''}`}
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password" required minLength={8} />
                    <button type="button" className="sp-eye" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {mismatch && <p className="sp-hint-err">Passwords do not match</p>}
                  {matched  && <p className="sp-hint-ok">✓ Passwords match</p>}
                </div>

                <button type="submit" className="sp-submit" disabled={loading || strength < 3 || !matched}>
                  {loading ? <span className="sp-spinner" /> : '🔒 Update Password'}
                </button>
              </form>

              <div className="sp-back">
                <a href="/login">← Back to Login</a>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default SetPassword;