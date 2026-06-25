import UserContext from "./UserContext";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {api} from '../../utils/SetAuthToken';
import setupAxiosInterceptors from "../../utils/SetupAxiosInterceptors";


const throwFriendlyError = (error) => {
  const message = error.response?.data.error || error.response?.data.message || error.message || "Something went wrong";
  const msgText = typeof message === 'object' ? (message.message || "Something went wrong") : message;
  const err = new Error(msgText);
  err.msg = msgText;
  if (error.response) {
    err.response = error.response;
  }
  if (error.response?.data?.errors) {
    err.errors = error.response.data.errors;
  }
  if (error.status !== undefined) {
    err.status = error.status;
  } else if (error.response?.status !== undefined) {
    err.status = error.response.status;
  }
  if (error.isAuthFailure !== undefined) {
    err.isAuthFailure = error.isAuthFailure;
  }
  throw err;
};

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
    } catch (error) {
      throwFriendlyError(error);
    }
  

  }


  //login auth
  const login = async(email, password, deviceInfo)=>{
   try{
    const response = await api.post('/api/auth/loginuser', { email, password, ...deviceInfo });
    console.log("response: ", response.data);
    
    


    return response.data;
  
    } catch (error) {
      throwFriendlyError(error);
    }
  }

// login/signup with google
const googleLogin = async(deviceInfo)=>{
  try {
    const response = await api.post('/api/auth/googlelogin', { ...deviceInfo});
    console.log("google login response: ", response.data);

    return response.data;
    } catch (error) {
      throwFriendlyError(error);
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
      throwFriendlyError(error);
    }
}
  const RefreshToken = useCallback(async (deviceId)=>{
    try {
      const response = await api.post('/api/auth/token',{ deviceId: deviceId }, { withCredentials: true });
      console.log("RefreshToken response:", response.data);
      return response.data.token;
      
    } catch (error) {
      console.error("Error refreshing token:", error);
      throwFriendlyError(error);
    }
  }, []);
  

  // Set up axios interceptors synchronously on first render so that
  // any initial requests (like fetchUser in child components) are intercepted correctly.
  setupAxiosInterceptors(navigate, RefreshToken);

  const logout = async (deviceId)=>{
    try {
      const response = await api.post('/api/auth/logout', { deviceId }, { withCredentials: true });
      console.log("Logout response:", response.data);
      
      return response.data;
      
    } catch (error) {
      console.error("Error during logout:", error);
      throwFriendlyError(error);
    }
  }

  const verifyOtp = async(email, otpCode, deviceInfo)=>{
    try {
      const response = await api.post('/api/auth/verify-otp', { email, otpCode, ...deviceInfo });
      console.log("verifyOtp response:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throwFriendlyError(error);
    }
  }

  const resendOtp = async(email)=>{
    try {
      const response = await api.post('/api/auth/resend', { email });
      console.log("resendOtp response:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error resending OTP:", error);
      throwFriendlyError(error);
    }
  }

  const forgetPassword = async(email)=>{
    try {
      const response = await api.post('/api/auth/forgetpassword', { email });
      console.log("forgetPassword response:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error during forget password:", error);
      throwFriendlyError(error);
    }
  }

  const CheckPasswordResetRequest = async(email)=>{
    try{
      const res =  await api.get('/api/auth/checkverification', {params: {email}});
      console.log("CheckPasswordResetRequest response:", res.data);
      return res.data;
    }
    catch(error){
      console.error("Error checking password reset request:", error);
      const message = error.response?.data.message || "Something went wrong";
      throw { errors: error.response?.data.errors, msg: message, message };
    }
  }

  const setPassword = async(email, newPassword, oldPassword=null)=>{
    try {
      const response = await api.post('/api/auth/resetpassword', {email, newPassword, oldPassword });
      console.log("setPassword response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error setting password:", error);
      throwFriendlyError(error);
    }
  }

  const value = useMemo( ()=>({
login, signup, getUser, user, setUser, googleLogin, RefreshToken, logout, verifyOtp, resendOtp, forgetPassword, setPassword, CheckPasswordResetRequest 
  }), [user]);

  return (
    <UserContext.Provider value={value}>
      {props.children}
    </UserContext.Provider>
  );
}