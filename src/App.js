import React, {useEffect, useContext} from 'react';
import './App.css';
import Login from './auth_pages/Login';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import SignUp from './auth_pages/SignUp';
import ChatRoom from './auth_pages/ChatRoom';
import { UserState } from './context/users/UserState';
import { MessageState } from './context/message/MessageState';
import { FriendsState } from './context/friends/FriendsState';
import UserContext from './context/users/UserContext';
import setupAxiosInterceptors from './utils/SetupAxiosInterceptors';
import SetAuthToken from './utils/SetAuthToken';
import socket from './server/socket';
import MessageContext from './context/message/MessageContext';



function AppContent() {
  console.log("AppContent rendered: ", socket);
  let navigate = useNavigate();
   const { getUser, setUser, user } = useContext(UserContext);
    

   

  useEffect(() => {
   const token = localStorage.getItem("token");
  if (!token) return; // no token, let user be null

  SetAuthToken(token); // attach token globally

  const fetchUser = async () => {
    try {
      const userData = await getUser();
      if (userData.success) {
        console.log("userData: ", userData);
        setUser({
          name: userData.user.name,
          email: userData.user.email,
          id: userData.user.id,
        });
        navigate("/");
      }
    } catch (error) {
      // Check explicitly for 401
    if (error.response && error.response.status === 401) {
      console.log("Token expired or invalid, logging out");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      SetAuthToken(null);
      navigate("/login");
    } else {
      console.log("Server not reachable or other error:", error);
      // Don't log out, keep user on current page or show error
    }
  }
  };

  fetchUser();
  }, []);
  return (
   <>
   
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<ChatRoom />} />
      </Routes>
   
    


   </>
  );
}

function App(){
  return(
    <>
    <UserState>
      <FriendsState>
     <MessageState>
    <Router>
      <AppContent />
    </Router>
    </MessageState>
    </FriendsState>
    </UserState>
    
    </>
  )
}

export default App;
