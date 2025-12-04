import React, {useEffect, useContext, useCallback, useState} from 'react';
import './App.css';
import Login from './auth_pages/Login';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
   Navigate,
  useLocation
} from "react-router-dom";
import SignUp from './auth_pages/SignUp';
import ChatRoom from './pages/ChatRoom';
import { UserState } from './context/users/UserState';
import { MessageState } from './context/message/MessageState';
import { FriendsState } from './context/friends/FriendsState';
import UserContext from './context/users/UserContext';
import SetAuthToken from './utils/SetAuthToken';
import socket from './server/socket';
import FrdConnection from './pages/FrdConnection';
import SuggestionsFriend from './component/friends/SuggestionFriend';
import Navbar from './component/Navbar';
import ReceivedReq from './component/friends/ReceivedReq'; 
import SentfrdReq from './component/friends/SentfrdReq';
import VerificationCode from './auth_pages/VerifyOtpCode';




function ProtectedRoute({ element }) {
  const { user } = useContext(UserContext);
  
  return user ? element : <Navigate to="/login" replace />;
}
function AppContent() {
  console.log("AppContent rendered: ", socket);
  let navigate = useNavigate();
   const { getUser, setUser , user, RefreshToken } = useContext(UserContext);
   const location = useLocation();
    
   const hideSidebar = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/verify-otp";
   const [isOnline, setIsOnline] = useState(navigator.onLine);

   


   const fetchUser = useCallback( async () => {

    const token = localStorage.getItem("token");
   if(!token)return; // attach current token
   SetAuthToken(token);
  
    try {
      
      const userData = await getUser();
      if (userData.success) {
        console.log("userData: ", userData);

        setUser({
      name: userData.user.name,
      email: userData.user.email,
      id: userData.user.id,
      onlineStatus: userData.user.onlineStatus,
      lastActive: userData.user.lastActive,
      profile_Url: userData.user.profile_Url,
      public_id: userData.user.public_id
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
    } else if (error.request && !error.response) {
    // Network error (no response from server)
    console.log("Network error: server not reachable or offline", error.message, isOnline);
    // Set a state to show network error banner
  } else {
    console.log("Other error:", error.message);
  }
  }}, [ setUser]);

  useEffect(() => {
  
  const goOffline = () => {
    console.log("Network error: server not reachable or offline");
    setUser(prevUser => ({ ...prevUser, onlineStatus: false }));
    setIsOnline(false)};
  const goOnline = () => {
    setIsOnline(true);
    fetchUser(); // fetch user data once back online
  };
  fetchUser();

  window.addEventListener("offline", goOffline);
  window.addEventListener("online", goOnline);

  return () => {
    window.removeEventListener("offline", goOffline);
    window.removeEventListener("online", goOnline);
  };
  }, [fetchUser]);
  return (
   <>
    <div className="flex flex-row ">
      {/* ✅ Sidebar only if logged in */}
      {user && !hideSidebar && <Navbar />}

      {/* Main content area */}
      <div className="flex-1 h-screen ">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-otp" element={<VerificationCode />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute element={<ChatRoom />} />} />
          <Route path="/friends/list" element={<ProtectedRoute element={<FrdConnection />} />} />
          <Route
            path="/friends/add-friend"
            element={<ProtectedRoute element={<SuggestionsFriend />} />}
          />
          <Route
            path="/friends/received-requests"
            element={<ProtectedRoute element={<ReceivedReq />} />}
          />
          <Route
            path="/friends/sent-requests"
            element={<ProtectedRoute element={<SentfrdReq />} />}
          />
        </Routes>
      </div>
    </div>
   
    


   </>
  );
}

function App(){
 
  return(
    <>
    <Router>
    <UserState>
      <FriendsState>
     <MessageState>
      
      <AppContent />
    </MessageState>
    </FriendsState>
    </UserState>
    </Router>
    
    </>
  )
}

export default App;
