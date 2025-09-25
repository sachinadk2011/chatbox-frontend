
import axios from "axios";
import SetAuthToken from "./SetAuthToken";

const setupAxiosInterceptors = (navigate) => {
  // request interceptor (attach token automatically)
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      SetAuthToken(token); // ensures axios always has the token
    }
    return config;
  });

  // response interceptor (catch 401 errors)
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        SetAuthToken(null);
        navigate("/login"); // redirect to login
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
