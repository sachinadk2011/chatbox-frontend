import SetAuthToken, { api } from "./SetAuthToken";


const setupAxiosInterceptors = (navigate, RefreshToken) => {
  
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
      if (error.response && error.response.status === 401) {
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
      // if refresh fails, log out
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      SetAuthToken(null);
      navigate("/login");
      return Promise.reject(error);
    }
    }
  );
};

export default setupAxiosInterceptors;
