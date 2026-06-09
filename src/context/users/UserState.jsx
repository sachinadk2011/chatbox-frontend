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
  throw new Error( error.response?.data.error || error.response?.data.message || error.message || { success: false, message: error.error || "Something went wrong" });
}
  

  }


  //login auth
  const login = async(email, password)=>{
   try{
    const response = await api.post('/api/auth/loginuser', { email, password });
    console.log("response: ", response.data);
    
    


    return response.data;
  
}catch(error){
  throw new Error( error.response?.data.error || error.response?.data.message || error.message || { success: false, message: error.error || "Something went wrong" });
}
  }

// login/signup with google
const googleLogin = async()=>{
  try {
    const response = await api.post('/api/auth/googlelogin');
    console.log("google login response: ", response.data);

    return response.data;
  } catch (error) {
    throw new Error( error.response?.data.error || error.response?.data.message || error.message || { success: false, message: error.error || "Something went wrong" });
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
      
      throw new Error( error.response?.data.error || error.response?.data.message || error.message || { success: false, message:error.error || "Something went wrong" });

  }
}
  const RefreshToken = useCallback(async ()=>{
    try {
      const response = await api.post('/api/auth/token',{}, { withCredentials: true });
      console.log("RefreshToken response:", response.data);
      return response.data.token;
      
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw new Error( error.response?.data.error||error.response?.data.msg || error.response?.data.message || error.message || { success: false, message:error.error || "Something went wrong" });
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
      throw new Error( error.response?.data.error || error.response?.data.message || error.message || { success: false, message:error.error || "Something went wrong" });
      
    }
  }

  const verifyOtp = async(email, otpCode)=>{
    try {
      const response = await api.post('/api/auth/verify-otp', { email, otpCode });
      console.log("verifyOtp response:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw new Error( error.response?.data.error || error.response?.data.message || error.message || { success: false, message:error.error || "Something went wrong" });
      
    }
  }

  const resendOtp = async(email)=>{
    try {
      const response = await api.post('/api/auth/resend', { email });
      console.log("resendOtp response:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error resending OTP:", error);
      throw new Error( error.response?.data.error || error.response?.data.message || error.message || { success: false, message:error.error || "Something went wrong" });
      
    }
  }

  const forgetPassword = async(email)=>{
    try {
      const response = await api.post('/api/auth/forgetpassword', { email });
      console.log("forgetPassword response:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error resending OTP:", error);
      throw new Error( error.response?.data.error || error.response?.data.message || error.message || { success: false, message:error.error || "Something went wrong" });
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
      const message = error.response?.data.message || error.response?.data.error || error.message || "Something went wrong";
      if (error.response?.status === 400) {
        const err = new Error(message);
        err.errors = error.response?.data.errors;
        err.msg = message;
        throw err;
      }
      const err = new Error(message);
      err.msg = message;
      throw err;
    }
  }

  return (
    <UserContext.Provider value={{ login, signup, getUser, user, setUser, googleLogin, RefreshToken, logout, verifyOtp, resendOtp, forgetPassword, setPassword, CheckPasswordResetRequest }}>
      {props.children}
    </UserContext.Provider>
  );
}