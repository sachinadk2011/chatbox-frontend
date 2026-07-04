import axios from "axios";
import SetAuthToken, { api } from "./SetAuthToken";
import { markBackendOffline, markBackend500 } from "../helpers/backendStatus";
import { getDeviceId } from "../helpers/userDeviceInfo";

let isSetup = false; // module-level flag — persists across renders

const setupAxiosInterceptors = (navigate, RefreshToken) => {
  if (isSetup) return; // prevent multiple setups
  isSetup = true;

  // request interceptor — attach token automatically on every request
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      SetAuthToken(token);
    }
    return config;
  });

  // response interceptor
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      // ── Network error (no response): server offline / sleeping ──
      if (!error.response) {
        if (!axios.isCancel(error)) {
          console.warn("Network error — server may be offline or waking up");
          markBackendOffline(); // 'offline' in dev, 'sleeping' in prod
        }
        return Promise.reject(error);
      }

      // ── 500-level server error: DB down, crash, etc. ──
      if (error.response.status >= 500) {
        console.error(`Server error ${error.response.status} — backend returned 5xx`);
        markBackend500(); // triggers full-screen 500 error page via StatusGate
        return Promise.reject(error);
      }

      // ── 401: access token expired — try to refresh once ──
      if (error.response.status === 401) {
        const originalRequest = error.config;

        if (!originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await RefreshToken(getDeviceId());
            if (newToken) {
              localStorage.setItem("token", newToken);
              SetAuthToken(newToken);
              originalRequest.headers["auth-token"] = newToken;
              // Retry the original request with the new token
              return api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed (403 invalid refresh token, or network error)
            console.error("Error refreshing token:", refreshError);

            const refreshStatus = refreshError?.response?.status;

            if (refreshStatus && refreshStatus < 500) {
              // Definitive auth failure (4xx from refresh endpoint) — log out
              console.warn("Refresh token rejected by server — logging out");
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              SetAuthToken(null);
              navigate("/login");

              // Attach a flag so callers know this was an auth failure, not a network error
              const authErr = new Error("Session expired. Please log in again.");
              authErr.isAuthFailure = true;
              authErr.status = 401;
              return Promise.reject(authErr);
            }
            // else: network error during refresh — fall through, let caller handle
          }
        }

        // No retry attempted (already retried), or refresh returned no token — log out
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        SetAuthToken(null);
        navigate("/login");

        const authErr = new Error("Session expired. Please log in again.");
        authErr.isAuthFailure = true;
        authErr.status = 401;
        return Promise.reject(authErr);
      }

      // All other 4xx errors — pass through to caller
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
