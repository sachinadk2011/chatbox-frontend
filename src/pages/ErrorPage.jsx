import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserContext from '../context/users/UserContext';

// ─── Config map — one entry per error type ───────────────────────────────────
const PAGE_CONFIG = {
  404: {
    emoji: '🔍',
    code: '404',
    title: 'Page Missing',
    description:
      'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
    accent: 'indigo',
    showRefresh: false,
    showHome: true,
  },
  500: {
    emoji: '⚠️',
    code: '500',
    title: 'Server Error',
    description:
      'Oops! Something went wrong on our end. The server may have crashed or the database may be temporarily down. We are checking automatically — hang tight!',
    accent: 'rose',
    showRefresh: true,
    showHome: true,
  },
  maintenance: {
    emoji: '🔧',
    code: null,
    title: "We'll Be Right Back!",
    description:
      'We are currently performing scheduled maintenance to improve our services. Everything will be back up shortly — we appreciate your patience!',
    accent: 'amber',
    showRefresh: false,
    showHome: false,
  },
  offline: {
    emoji: '📡',
    code: 'Offline',
    title: 'Server Unreachable',
    description:
      'We cannot reach the backend server. Make sure the backend is running. We are checking automatically every few seconds — you will be taken back automatically when it recovers.',
    accent: 'rose',
    showRefresh: true,
    showHome: false,
  },
  sleeping: {
    emoji: '😴',
    code: null,
    title: 'Server is Waking Up',
    description:
      'The server is on a free-tier plan and went to sleep after a period of inactivity. It usually wakes up in 10–30 seconds. Your session is safe — you will be taken back automatically.',
    accent: 'amber',
    showRefresh: true,
    showHome: false,
  },
};

// ─── Accent colour palettes (Tailwind classes) ───────────────────────────────
const ACCENT = {
  indigo: {
    bg: 'from-indigo-50 via-white to-purple-50',
    bigNum: 'text-indigo-100',
    badge: 'bg-indigo-600',
    badgeText: 'text-white',
    pill: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    btnPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200',
    btnSecondary: 'bg-white hover:bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    dot: 'bg-indigo-400',
    pulse: 'bg-indigo-400',
  },
  rose: {
    bg: 'from-rose-50 via-white to-orange-50',
    bigNum: 'text-rose-100',
    badge: 'bg-rose-600',
    badgeText: 'text-white',
    pill: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    btnPrimary: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
    btnSecondary: 'bg-white hover:bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    dot: 'bg-rose-400',
    pulse: 'bg-rose-400',
  },
  amber: {
    bg: 'from-amber-50 via-white to-yellow-50',
    bigNum: 'text-amber-100',
    badge: 'bg-amber-500',
    badgeText: 'text-white',
    pill: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    btnPrimary: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200',
    btnSecondary: 'bg-white hover:bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    dot: 'bg-amber-400',
    pulse: 'bg-amber-400',
  },
};

// ─── Animated dots for maintenance / sleeping ─────────────────────────────────
function PulseDots({ color }) {
  return (
    <div className="flex items-center gap-2 justify-center mt-6">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-3 h-3 rounded-full ${color} animate-bounce`}
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}

// ─── Auto-checking indicator shown while polling ──────────────────────────────
function AutoCheckBadge({ accent }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
      <span
        className={`inline-block w-2 h-2 rounded-full ${ACCENT[accent].pulse} animate-pulse`}
      />
      Checking automatically every few seconds…
    </div>
  );
}

// ─── Spinner icon ─────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
      />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
/**
 * ErrorPage — reusable full-screen error / maintenance page.
 *
 * Props:
 *   type       — '404' | '500' | 'maintenance' | 'offline' | 'sleeping'
 *   onRetry    — optional async fn called when user clicks "Check Now"
 *                If provided AND ping succeeds, StatusGate auto-recovers
 *                (no page reload needed — React Router restores original URL).
 *   isRetrying — boolean passed from StatusGate while ping is in-flight
 */
const ErrorPage = ({ type = '404', onRetry, isRetrying = false }) => {
  const config = PAGE_CONFIG[type] ?? PAGE_CONFIG['404'];
  const colors = ACCENT[config.accent];

  const { user } = useContext(UserContext);
  const navigate  = useNavigate();
  const location  = useLocation();

  const [retryFailed, setRetryFailed] = useState(false);

  const homeLabel = user?.id ? 'Go to Chats' : 'Go to Login';
  const homePath  = user?.id ? '/chats' : '/login';

  // Whether this error type has auto-recovery polling in StatusGate
  const hasAutoRecovery = type === 'offline' || type === '500' || type === 'sleeping';

  const handleRefreshClick = async () => {
    setRetryFailed(false);
    if (onRetry) {
      // StatusGate's smart ping — if it succeeds, markBackendOnline() is called
      // and this component unmounts automatically (no reload needed).
      await onRetry();
      // If we reach here, the ping failed (server still down)
      setRetryFailed(true);
    } else {
      // Fallback for cases without onRetry (shouldn't happen in normal usage)
      window.location.reload();
    }
  };

  return (
    <div
      className={`error-page min-h-screen w-full bg-gradient-to-br ${colors.bg}
                  flex items-center justify-center p-4`}
    >
      <div className="w-full max-w-lg text-center">

        {/* ── Big number / code ── */}
        {config.code ? (
          <div className="relative mb-8 select-none">
            {/* ghost number behind badge */}
            <p className={`text-[140px] sm:text-[180px] font-black leading-none ${colors.bigNum}`}>
              {config.code}
            </p>
            {/* floating badge */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`${colors.badge} rounded-2xl shadow-lg px-5 py-3 flex items-center gap-2`}>
                <span className="text-2xl" role="img" aria-label="icon">{config.emoji}</span>
                <span className={`text-lg font-bold ${colors.badgeText}`}>{config.code}</span>
              </div>
            </div>
          </div>
        ) : (
          /* maintenance / sleeping — large emoji instead of a number */
          <div className="mb-8">
            <span className="text-[90px] leading-none select-none" role="img" aria-label="status icon">
              {config.emoji}
            </span>
          </div>
        )}

        {/* ── Heading ── */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-3 tracking-tight">
          {config.title}
        </h1>

        {/* ── Description ── */}
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6 px-2">
          {config.description}
        </p>

        {/* ── Current path pill (only for 404 / 500) ── */}
        {config.code && config.code !== 'Offline' && (
          <div className="flex justify-center mb-8">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono ${colors.pill}`}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101
                     m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="truncate max-w-[260px]">{location.pathname}</span>
            </span>
          </div>
        )}

        {/* ── Retry failed notice ── */}
        {retryFailed && (
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-rose-600 font-medium">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Server still unreachable — will keep checking automatically.
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">

          {config.showRefresh && (
            <button
              id="error-page-check-now"
              onClick={handleRefreshClick}
              disabled={isRetrying}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                          text-sm shadow-md transition-all duration-200 active:scale-95
                          disabled:opacity-60 disabled:cursor-not-allowed
                          ${colors.btnPrimary}`}
            >
              {isRetrying ? <Spinner /> : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581
                       m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {isRetrying ? 'Checking…' : 'Check Now'}
            </button>
          )}

          {config.showHome && (
            <button
              id="error-page-go-home"
              onClick={() => navigate(homePath, { replace: true })}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                          text-sm transition-all duration-200 active:scale-95
                          ${config.showRefresh ? colors.btnSecondary : `${colors.btnPrimary} shadow-md`}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10
                     a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011
                     1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {homeLabel}
            </button>
          )}

        </div>

        {/* ── Auto-check indicator ── */}
        {hasAutoRecovery && <AutoCheckBadge accent={config.accent} />}

        {/* ── Maintenance animated dots ── */}
        {type === 'maintenance' && <PulseDots color={colors.dot} />}

        {/* ── Maintenance status note ── */}
        {type === 'maintenance' && (
          <p className="mt-4 text-xs text-gray-400">
            Estimated downtime: a few minutes · Check back soon
          </p>
        )}

      </div>
    </div>
  );
};

export default ErrorPage;
