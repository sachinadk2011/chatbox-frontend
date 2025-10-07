import React, {useEffect, useContext} from 'react';
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
import setupAxiosInterceptors from './utils/SetupAxiosInterceptors';
import SetAuthToken from './utils/SetAuthToken';
import socket from './server/socket';
import MessageContext from './context/message/MessageContext';
import FrdConnection from './pages/FrdConnection';
import FriendList from './component/friends/FriendList';
import SuggestionsFriend from './component/friends/SuggestionFriend';
import Navbar from './component/Navbar';
import ReceivedReq from './component/friends/ReceivedReq'; 



function ProtectedRoute({ element }) {
  const { user } = useContext(UserContext);
  
  return user ? element : <Navigate to="/login" replace />;
}
function AppContent() {
  console.log("AppContent rendered: ", socket);
  let navigate = useNavigate();
   const { getUser, setUser , user} = useContext(UserContext);
   const location = useLocation();
    
   const hideSidebar = location.pathname === "/login" || location.pathname === "/signup";

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
    <div className="flex flex-row ">
      {/* ✅ Sidebar only if logged in */}
      {user && !hideSidebar && <Navbar />}

      {/* Main content area */}
      <div className="flex-1 h-screen ">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute element={<ChatRoom />} />} />
          <Route path="/friends" element={<ProtectedRoute element={<FrdConnection />} />} />
          <Route
            path="/friends/add-friend"
            element={<ProtectedRoute element={<SuggestionsFriend />} />}
          />
          <Route
            path="/friends/received-requests"
            element={<ProtectedRoute element={<ReceivedReq />} />}
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
