import { useContext, useState } from 'react';
import UserContext from '../context/users/UserContext';
import { useNavigate } from "react-router-dom";
import SetAuthToken from '../utils/SetAuthToken';

const VerificationCode = () => {
  const { verifyOtp, getUser, setUser, resendOtp } = useContext(UserContext);
  let navigate = useNavigate();
  const { email, from } = JSON.parse(localStorage.getItem("tempData")) || { email: "", from: "" };

  const [otpCode, setOtpCode] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInput = (e, index) => {
    const value = e.target.value.replace(/\D/, "");
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    setError("");
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otpCode[index] && index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
      const newOtp = [...otpCode];
      newOtp[index] = "";
      setOtpCode(newOtp);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = Array(6).fill("");
    pasted.split("").forEach((c, i) => { newOtp[i] = c; });
    setOtpCode(newOtp);
    document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otpCode.join("");
    if (code.length < 6) { setError("Please enter all 6 digits."); return; }
    setLoading(true); setError("");
    try {
      const json = await verifyOtp(email, code);
      if (from === "signup") {
        localStorage.setItem("token", json.token);
        SetAuthToken(json.token);
        const userdata = await getUser();
        localStorage.setItem("user", JSON.stringify(userdata.user));
        setUser(userdata.user);
        navigate("/");
      } else if (from === "resetpassword") {
        navigate("/set-new-password");
      }
    } catch (err) {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true); setError(""); setSuccess("");
    try {
      await resendOtp(email);
      setSuccess("New code sent! Check your inbox.");
      setOtpCode(Array(6).fill(""));
      document.getElementById("otp-0")?.focus();
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email
    ? `${email.split("@")[0].slice(0, 3)}***@${email.split("@")[1]}`
    : "your email";

  const filled = otpCode.filter(Boolean).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }

        .otp-page {
          min-height: 100vh;
          background: linear-gradient(145deg, #eef2ff 0%, #faf5ff 50%, #eef2ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          font-family: 'Inter', sans-serif;
          overflow-y: auto;
        }

        .otp-card {
          background: #fff;
          border-radius: 28px;
          box-shadow: 0 24px 80px rgba(99,102,241,0.14);
          padding: 52px 44px;
          width: 100%;
          max-width: 460px;
          border: 1px solid #ede9fe;
          text-align: center;
          animation: fadeUp 0.4s ease both;
        }

        /* ── Icon ── */
        .otp-icon-wrap { margin-bottom: 28px; display: flex; justify-content: center; }
        .otp-icon-ring {
          width: 88px; height: 88px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 32px rgba(99,102,241,0.35);
          font-size: 40px;
          animation: pulse 3s ease-in-out infinite;
        }

        .otp-heading { font-size: 1.8rem; font-weight: 800; color: #1e1b4b; margin: 0 0 10px; }
        .otp-subtext { font-size: 0.9rem; color: #6b7280; line-height: 1.7; margin: 0 0 10px; }
        .otp-email   { font-weight: 700; color: #4f46e5; display: block; margin-bottom: 32px; font-size: 0.95rem; }

        /* ── Progress ── */
        .otp-progress-bar {
          height: 4px;
          background: #e5e7eb;
          border-radius: 4px;
          margin-bottom: 28px;
          overflow: hidden;
        }
        .otp-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        /* ── Alerts ── */
        .otp-error {
          background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
          border-radius: 10px; padding: 12px 16px; font-size: 0.875rem;
          margin-bottom: 20px; display: flex; align-items: center; justify-content: center;
          gap: 8px; animation: shake 0.4s ease;
        }
        .otp-success {
          background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a;
          border-radius: 10px; padding: 12px 16px; font-size: 0.875rem;
          margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        /* ── OTP inputs row ── */
        .otp-inputs {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 32px;
        }
        .otp-box {
          width: 56px;
          height: 64px;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          font-size: 1.6rem;
          font-weight: 700;
          text-align: center;
          background: #f8faff;
          color: #1e1b4b;
          outline: none;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
          caret-color: #6366f1;
          flex-shrink: 1;
        }
        .otp-box:focus {
          border-color: #6366f1;
          background: #eef2ff;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
          transform: scale(1.08);
        }
        .otp-box.filled {
          border-color: #a5b4fc;
          background: #eef2ff;
          color: #4338ca;
        }

        /* ── Submit ── */
        .otp-submit {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff; border: none; border-radius: 14px; padding: 16px;
          font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(99,102,241,0.4);
          font-family: 'Inter', sans-serif;
          transition: opacity 0.2s, transform 0.15s;
          margin-bottom: 24px;
        }
        .otp-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 26px rgba(99,102,241,0.5); }
        .otp-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .otp-spinner {
          width: 20px; height: 20px;
          border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.75s linear infinite; display: inline-block;
        }

        /* ── Resend ── */
        .otp-resend-row {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; margin-bottom: 24px;
        }
        .otp-resend-text { font-size: 0.875rem; color: #6b7280; }
        .otp-resend-btn {
          background: none; border: none; color: #6366f1;
          font-weight: 700; font-size: 0.875rem; cursor: pointer;
          padding: 0; font-family: 'Inter', sans-serif;
          text-decoration: underline;
        }
        .otp-resend-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Footer ── */
        .otp-back {
          border-top: 1px solid #f3f4f6;
          padding-top: 20px;
        }
        .otp-back a {
          color: #9ca3af; font-size: 0.875rem; text-decoration: none; font-weight: 500;
        }
        .otp-back a:hover { color: #6366f1; }

        /* ═══════════════ MOBILE ═══════════════ */
        @media (max-width: 520px) {
          .otp-card { padding: 40px 24px; border-radius: 22px; }
          .otp-heading { font-size: 1.5rem; }
          .otp-box { width: 44px; height: 54px; font-size: 1.3rem; border-radius: 12px; gap: 0; }
          .otp-inputs { gap: 7px; }
          .otp-icon-ring { width: 76px; height: 76px; font-size: 34px; }
        }
        @media (max-width: 380px) {
          .otp-box { width: 38px; height: 48px; font-size: 1.15rem; border-radius: 10px; }
          .otp-inputs { gap: 5px; }
          .otp-card { padding: 32px 18px; }
        }
      `}</style>

      <div className="otp-page auth-page">
        <div className="otp-card">
          {/* Icon */}
          <div className="otp-icon-wrap">
            <div className="otp-icon-ring">📧</div>
          </div>

          <h1 className="otp-heading">Verify your email</h1>
          <p className="otp-subtext">We sent a 6-digit code to</p>
          <span className="otp-email">{maskedEmail}</span>

          {/* Progress bar */}
          <div className="otp-progress-bar">
            <div className="otp-progress-fill" style={{ width: `${(filled / 6) * 100}%` }} />
          </div>

          {error   && <div className="otp-error"><span>⚠️</span>{error}</div>}
          {success && <div className="otp-success"><span>✅</span>{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* OTP inputs */}
            <div className="otp-inputs">
              {otpCode.map((val, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  autoFocus={i === 0}
                  className={`otp-box${val ? ' filled' : ''}`}
                  onInput={(e) => handleInput(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                />
              ))}
            </div>

            <button type="submit" className="otp-submit"
              disabled={loading || filled < 6}>
              {loading ? <span className="otp-spinner" /> : '✓ Verify Account'}
            </button>
          </form>

          <div className="otp-resend-row">
            <span className="otp-resend-text">Didn't receive the code?</span>
            <button className="otp-resend-btn" onClick={handleResend} disabled={resending}>
              {resending ? 'Sending…' : 'Resend Code'}
            </button>
          </div>

          <div className="otp-back">
            <a href="/login">← Back to Login</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerificationCode;