import UserContext from "./UserContext";
import React, { useState } from 'react';
import axios from 'axios';


export const UserState = (props) => {
  axios.defaults.baseURL = process.env.REACT_APP_URL;


  
  const [user, setUser] = React.useState("")

  //signup
  const signup = async(name, email, password)=>{
    try{
    const response = await axios.post('/api/auth/createuser', { name,email, password });
    
    return response.data;
  
}catch(error){
  return error.response?.data || { success: false, message: error.message || "Something went wrong" };
}
  }


  //login auth
  const login = async(email, password)=>{
   try{
    const response = await axios.post('/api/auth/loginuser', { email, password });
    console.log("response: ", response.data);
    
    
    return response.data;
  
}catch(error){
  return error.response?.data || { success: false, message: error.message || "Something went wrong" };
}
  }


    
  return (
    <UserContext.Provider value={{ user, setUser,login,signup }}>
      {props.children}
    </UserContext.Provider>
  );
}