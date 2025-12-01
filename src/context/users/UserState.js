import UserContext from "./UserContext";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {api} from '../../utils/SetAuthToken';
import setupAxiosInterceptors from "../../utils/SetupAxiosInterceptors";

export const UserState = (props) => {
  let navigate = useNavigate();
 
  const [user, setUser] = useState(
    () => {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : {
        name: "",
        email: "",
        id: "",
        onlineStatus: false,
        lastActive: null,
        profile_Url: null,
        public_id: null
      };
    }
  );
  


  //signup
  const signup = async(name, email, password)=>{
    try {
    const response = await api.post('/api/auth/createuser', { name,email, password });

    console.log("response: ", response.data);

    

    return response.data;
    }catch(error){
  throw error.response?.data.error || error.response?.data.message || { success: false, message: error.error || "Something went wrong" };
}
  

  }


  //login auth
  const login = async(email, password)=>{
   try{
    const response = await api.post('/api/auth/loginuser', { email, password });
    console.log("response: ", response.data);
    
    


    return response.data;
  
}catch(error){
  throw error.response?.data.error || error.response?.data.message || { success: false, message: error.error || "Something went wrong" };
}
  }

// login/signup with google
const googleLogin = async()=>{
  try {
    const response = await api.post('/api/auth/googlelogin');
    console.log("google login response: ", response.data);

    return response.data;
  } catch (error) {
    throw error.response?.data.error || error.response?.data.message || { success: false, message: error.error || "Something went wrong" };
  } 
}

  // gets user
  const getUser = async()=>{
    try {
      const response = await api.get('/api/auth/getuser'
        
      );
      console.log("getUser response:", response.data);

       
      setUser({
      name: response.data.user.name,
      email: response.data.user.email,
      id: response.data.user.id,
      onlineStatus: response.data.user.onlineStatus,
      lastActive: response.data.user.lastActive,
      profile_Url: response.data.user.profile_Url,
      public_id: response.data.user.public_id
    });
    console.log("getUser response:", response.data);
      
      return response.data;
    } catch (error) {
      
      throw error.response?.data.error || error.response?.data.message || { success: false, message:error.error || "Something went wrong" };

  }
}
  const RefreshToken = useCallback(async ()=>{
    try {
      const response = await api.post('/api/auth/token',{}, { withCredentials: true });
      console.log("RefreshToken response:", response.data);
      return response.data.token;
      
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error.response?.data.error||error.response?.data.msg || error.response?.data.message || { success: false, message:error.error || "Something went wrong" };
    }
  })

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setupAxiosInterceptors(navigate, RefreshToken);
  }, [ RefreshToken]);

  const logout = async ()=>{
    try {
      const response = await api.post('/api/auth/logout', {}, { withCredentials: true });
      console.log("Logout response:", response.data);
      
      return response.data;
      
    } catch (error) {
      console.error("Error during logout:", error);
      throw error.response?.data.error || error.response?.data.message || { success: false, message:error.error || "Something went wrong" };
      
    }
  }

  return (
    <UserContext.Provider value={{ login, signup, getUser, user, setUser, googleLogin, RefreshToken, logout }}>
      {props.children}
    </UserContext.Provider>
  );
}