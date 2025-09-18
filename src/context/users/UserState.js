import UserContext from "./UserContext";

import axios from 'axios';


export const UserState = (props) => {
  axios.defaults.baseURL = process.env.REACT_APP_URL;


  
  

  //signup
  const signup = async(name, email, password)=>{
    
    const response = await axios.post('/api/auth/createuser', { name,email, password });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Signup failed');
    }
    
    return response.data;
  

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
    <UserContext.Provider value={{ login, signup, getUser }}>
      {props.children}
    </UserContext.Provider>
  );
}