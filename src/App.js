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



function AppContent() {
  let navigate = useNavigate();
   const { getUser, setUser } = useContext(UserContext);

   useEffect(() => {
  setupAxiosInterceptors(navigate);
}, []);

  useEffect(() => {
   const token = localStorage.getItem("token");
  if (!token) return; // no token, let user be null

  SetAuthToken(token); // attach token globally

  const fetchUser = async () => {
    try {
      const userData = await getUser();
      if (userData) {
        console.log("userData: ", userData);
        setUser({
          name: userData.name,
          email: userData.email,
          id: userData.id,
        });
      }
    } catch (error) {
      console.log("Token expired or invalid, logging out");
      localStorage.removeItem("token");
      SetAuthToken(null);
      navigate("/login");
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
