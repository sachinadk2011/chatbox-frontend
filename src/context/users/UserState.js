import UserContext from "./UserContext";
import { useState } from "react";


import axios from 'axios';


export const UserState = (props) => {
  axios.defaults.baseURL = process.env.REACT_APP_URL;
  const [user, setUser] = useState(
    () => {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : {
        name: "",
        email: "",
        id: ""
      };
    }
  );
  





  
  

  //signup
  const signup = async(name, email, password)=>{
    try {
    const response = await axios.post('/api/auth/createuser', { name,email, password });

    console.log("response: ", response.data);

    

    return response.data;
    }catch(error){
  throw error.response?.data.error || error.response?.data.message || { success: false, message: error.error || "Something went wrong" };
}
  

  }


  //login auth
  const login = async(email, password)=>{
   try{
    const response = await axios.post('/api/auth/loginuser', { email, password });
    console.log("response: ", response.data);
    
    


    return response.data;
  
}catch(error){
  throw error.response?.data.error || error.response?.data.message || { success: false, message: error.error || "Something went wrong" };
}
  }

// login/signup with google
const googleLogin = async()=>{
  try {
    const response = await axios.post('/api/auth/googlelogin');
    console.log("google login response: ", response.data);

    return response.data;
  } catch (error) {
    throw error.response?.data.error || error.response?.data.message || { success: false, message: error.error || "Something went wrong" };
  } 
}

  // gets user
  const getUser = async()=>{
    try {
      const response = await axios.get('/api/auth/getuser'
        
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

  return (
    <UserContext.Provider value={{ login, signup, getUser, user, setUser, googleLogin }}>
      {props.children}
    </UserContext.Provider>
  );
}