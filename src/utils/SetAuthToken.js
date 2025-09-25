import axios from "axios";

const SetAuthToken = (token)=>{
 if (token) {
    // Apply to every request
    axios.defaults.headers.common["auth-token"] = token;
  } else {
    // Remove if no token
    delete axios.defaults.headers.common["auth-token"];
  }
};
export default SetAuthToken;