import { useContext, useState } from 'react';
import UserContext from '../context/users/UserContext';
import { useNavigate } from "react-router-dom";

const UpdateEmail = () => {
  const { forgetPassword } = useContext(UserContext);
  let navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgetPassword(email);
      localStorage.setItem("tempData", JSON.stringify({ email, from: "resetpassword" }));
      navigate("/verify-otp");
    } catch (err) {
      setError("No account found with that email. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }

        .fp-page {
          min-height: 100vh;
          background: linear-gradient(145deg, #eef2ff 0%, #faf5ff 50%, #eef2ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          font-family: 'Inter', sans-serif;
          overflow-y: auto;
        }
        .fp-card {
          background: #fff;
          border-radius: 28px;
          box-shadow: 0 24px 80px rgba(99,102,241,0.13);
          padding: 52px 44px;
          width: 100%;
          max-width: 460px;
          border: 1px solid #ede9fe;
          text-align: center;
          animation: fadeUp 0.4s ease both;
        }
        .fp-icon-wrap { display: flex; justify-content: center; margin-bottom: 28px; }
        .fp-icon-ring {
          width: 88px; height: 88px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 32px rgba(99,102,241,0.35);
          font-size: 40px;
          animation: pulse 3s ease-in-out infinite;
        }
        .fp-heading { font-size: 1.75rem; font-weight: 800; color: #1e1b4b; margin: 0 0 12px; }
        .fp-subtext { font-size: 0.9rem; color: #6b7280; line-height: 1.7; margin: 0 0 30px; }

        .fp-error {
          background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
          border-radius: 10px; padding: 12px 16px; font-size: 0.875rem;
          margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
          justify-content: center;
        }
        .fp-form { display: flex; flex-direction: column; gap: 16px; text-align: left; }
        .fp-label  { font-size: 0.875rem; font-weight: 600; color: #374151; display: block; margin-bottom: 6px; }
        .fp-input {
          width: 100%; padding: 14px 16px;
          border: 2px solid #e5e7eb; border-radius: 12px;
          font-size: 0.95rem; color: #111827; background: #fafafa;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .fp-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          background: #fff;
        }
        .fp-submit {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff; border: none; border-radius: 13px; padding: 15px;
          font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(99,102,241,0.4);
          font-family: 'Inter', sans-serif;
          transition: opacity 0.2s, transform 0.15s;
        }
        .fp-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 26px rgba(99,102,241,0.5); }
        .fp-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .fp-spinner {
          width: 20px; height: 20px;
          border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.75s linear infinite; display: inline-block;
        }
        .fp-info {
          display: flex; gap: 12px; background: #eef2ff;
          border: 1px solid #c7d2fe; border-radius: 14px;
          padding: 16px; margin-top: 20px; text-align: left; align-items: flex-start;
        }
        .fp-info-icon { font-size: 22px; flex-shrink: 0; margin-top: 1px; }
        .fp-info-text { font-size: 0.85rem; color: #4b5563; line-height: 1.65; margin: 0; }
        .fp-back { border-top: 1px solid #f3f4f6; padding-top: 20px; margin-top: 24px; }
        .fp-back a { color: #9ca3af; font-size: 0.875rem; text-decoration: none; font-weight: 500; }
        .fp-back a:hover { color: #6366f1; }

        /* ═══════════════ MOBILE ═══════════════ */
        @media (max-width: 520px) {
          .fp-card { padding: 36px 22px; border-radius: 22px; }
          .fp-heading { font-size: 1.5rem; }
          .fp-icon-ring { width: 74px; height: 74px; font-size: 34px; }
        }
        @media (max-width: 380px) {
          .fp-card { padding: 28px 16px; }
        }
      `}</style>

      <div className="fp-page">
        <div className="fp-card">
          <div className="fp-icon-wrap">
            <div className="fp-icon-ring">🔑</div>
          </div>

          <h1 className="fp-heading">Forgot Password?</h1>
          <p className="fp-subtext">
            No worries! Enter your email and we'll send you a code to reset your password.
          </p>

          {error && (
            <div className="fp-error"><span>⚠️</span>{error}</div>
          )}

          <form onSubmit={handleSubmit} className="fp-form">
            <div>
              <label className="fp-label" htmlFor="fp-email">Email address</label>
              <input
                id="fp-email"
                className="fp-input"
                type="email"
                value={email}
                onChange={e => { setError(""); setEmail(e.target.value); }}
                placeholder="you@example.com"
                required
              />
            </div>
            <button type="submit" className="fp-submit" disabled={loading}>
              {loading ? <span className="fp-spinner" /> : '📧 Send Reset Code'}
            </button>
          </form>

          <div className="fp-info">
            <span className="fp-info-icon">💡</span>
            <p className="fp-info-text">
              A 6-digit verification code will be sent to your inbox. Check your spam folder if you don't see it within a minute.
            </p>
          </div>

          <div className="fp-back">
            <a href="/login">← Back to Login</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateEmail;