import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_URL,
  withCredentials: true
});

const SetAuthToken = (token)=>{
 if (token) {
    // Apply to every request
    api.defaults.headers.common["auth-token"] = token;
  } else {
    // Remove if no token
    delete api.defaults.headers.common["auth-token"];
  }
};
export default SetAuthToken;
export { api };