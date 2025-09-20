import UserContext from "./UserContext";
import { useState } from "react";

import axios from 'axios';


export const UserState = (props) => {
  axios.defaults.baseURL = process.env.REACT_APP_URL;
  const [user, setUser] = useState(() => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
});



  
  

  //signup
  const signup = async(name, email, password)=>{
    
    const response = await axios.post('/api/auth/createuser', { name,email, password });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Signup failed');
    }

    setUser({
      name: response.data.user.name,
      email: response.data.user.email,
      id: response.data.user.id
    });

    return response.data;
  

  }


  //login auth
  const login = async(email, password)=>{
   try{
    const response = await axios.post('/api/auth/loginuser', { email, password });
    console.log("response: ", response.data);
    
    setUser({
      name: response.data.user.name,
      email: response.data.user.email,
      id: response.data.user.id
    });


    return response.data;
  
}catch(error){
  return error.response?.data || { success: false, message: error.message || "Something went wrong" };
}
  }

  // gets user
  const getUser = async()=>{
    try {
      const response = await axios.get('/api/auth/getuser', 
        {
          headers: {
            'auth-token': localStorage.getItem('token')
          }
        }
      );
      
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: error.message || "Something went wrong" };
    }

  }

  return (
    <UserContext.Provider value={{ login, signup, getUser, user, setUser }}>
      {props.children}
    </UserContext.Provider>
  );
}