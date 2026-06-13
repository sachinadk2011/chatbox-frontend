import SetAuthToken, { api } from "./SetAuthToken";

let isSetup = false; // module-level flag — persists across renders

const setupAxiosInterceptors = (navigate, RefreshToken) => {
  if (isSetup) return; // prevent multiple setups
  isSetup = true;

  // request interceptor (attach token automatically)
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      SetAuthToken(token); // ensures axios always has the token
    }
    return config;
  });

  // response interceptor (catch 401 errors)
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      // ── Network error (server cold start / offline) — DO NOT logout ──
      if (!error.response) {
        console.warn("Network error — server may be waking up");
        return Promise.reject(error); // just reject, let caller handle
      }

      if (error.response.status === 401) {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await RefreshToken();
            if (newToken) {
              localStorage.setItem("token", newToken);
              SetAuthToken(newToken);
              originalRequest.headers["auth-token"] = newToken;
              return api(originalRequest);
            }
          } catch (err) {
            console.log("Refresh token failed:", err);
          }
        }
        // Refresh failed — log out
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        SetAuthToken(null);
        navigate("/login");
      }
      // ── MUST always reject so callers get the error, not undefined ──
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
