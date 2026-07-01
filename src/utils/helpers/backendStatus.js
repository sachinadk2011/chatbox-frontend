/**
 * Module-level backend status store.
 *
 * Stored OUTSIDE React so it survives React 18 Strict Mode's
 * mount → unmount → remount cycle (where useEffect-based listeners
 * get torn down before the network error fires).
 *
 * Modes:
 *  'online'   — server is reachable
 *  'offline'  — DEV: hard stop (backend down / DB crash), show full error page
 *  'sleeping' — PROD: Render cold-start, show non-blocking banner + auto-retry
 *  'error500' — any 500-level HTTP response from the server (both DEV & PROD)
 *
 * Environment detection uses VITE_ENV (set in .env) instead of Vite's
 * built-in import.meta.env.DEV so you can control behaviour independently
 * of the actual build mode (e.g. test production behaviour locally).
 */

// Read from your own .env variable: VITE_ENV="development" or "production"
const IS_DEV = import.meta.env.VITE_ENV === 'development';

let _status = 'online'; // 'online' | 'offline' | 'sleeping' | 'error500'
const _listeners = new Set();

function _notify() {
  _listeners.forEach((cb) => cb(_status));
}

/**
 * Call when a NETWORK error is detected (no response at all).
 *  - DEV  → 'offline'  (full-screen error page, must fix backend)
 *  - PROD → 'sleeping' (non-blocking banner, auto-retry for Render cold-start)
 */
export function markBackendOffline() {
  if (_status !== 'online') return; // don't fire twice
  _status = IS_DEV ? 'offline' : 'sleeping';
  _notify();
}

/**
 * Call when the server returns a 500-level HTTP error.
 * Shown as a full-screen 500 error page in BOTH dev and prod.
 */
export function markBackend500() {
  if (_status === 'error500') return; // don't fire twice
  _status = 'error500';
  _notify();
}

/** Call to reset back to online (e.g. after successful retry / page refresh) */
export function markBackendOnline() {
  if (_status === 'online') return;
  _status = 'online';
  _notify();
}

/** Synchronously read current status */
export function getBackendStatus() {
  return _status;
}

/** Backwards-compat helper used by App.jsx */
export function isBackendOffline() {
  return _status !== 'online';
}

/** True only when IS_DEV flag is active (based on VITE_ENV) */
export function isDevEnvironment() {
  return IS_DEV;
}

/** Subscribe to status changes. Returns an unsubscribe function. */
export function subscribeBackendStatus(cb) {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}
