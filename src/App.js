import React, { useContext, useEffect, useCallback, useState } from 'react';
import './App.css';
import Login from './auth_pages/Login';
import {
  BrowserRouter as Router, Routes, Route,
  useNavigate, Navigate, useLocation
} from "react-router-dom";
import SignUp from './auth_pages/SignUp';
import ChatRoom from './pages/ChatRoom';
import { UserState } from './context/users/UserState';
import { MessageState } from './context/message/MessageState';
import { FriendsState } from './context/friends/FriendsState';
import UserContext from './context/users/UserContext';
import MessageContext from './context/message/MessageContext';
import SetAuthToken from './utils/SetAuthToken';
import socket from './server/socket';
import FrdConnection from './pages/FrdConnection';
import SuggestionsFriend from './component/friends/SuggestionFriend';
import Navbar from './component/Navbar';
import ReceivedReq from './component/friends/ReceivedReq';
import SentfrdReq from './component/friends/SentfrdReq';
import VerificationCode from './auth_pages/VerifyOtpCode';
import UpdateEmail from './auth_pages/UpdateEmail';
import SetPassword from './auth_pages/SetPassword';

const EMPTY_USER = {
  receiverId: null, receiverName: '', senderId: null, senderName: '',
  lastActive: null, onlineStatus: false, profile_url: null,
};

function ProtectedRoute({ element }) {
  const { user } = useContext(UserContext);
  return user?.id ? element : <Navigate to="/login" replace />;
}

function AppContent() {
  const navigate = useNavigate();
  const { getUser, setUser, user } = useContext(UserContext);
  const { setSelectedUser } = useContext(MessageContext);
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const hideSidebar = ['/login', '/signup', '/verify-otp', '/forget-password', '/set-new-password']
    .includes(location.pathname);

  // ── Close chat on ANY route change (going to / from /friends also closes) ──
  useEffect(() => {
    setSelectedUser(EMPTY_USER);
  }, [location.pathname, setSelectedUser]);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    SetAuthToken(token);
    try {
      const userData = await getUser();
      if (userData.success) {
        setUser({
          name: userData.user.name, email: userData.user.email, id: userData.user.id,
          onlineStatus: userData.user.onlineStatus, lastActive: userData.user.lastActive,
          profile_Url: userData.user.profile_Url, public_id: userData.user.public_id,
        });
        navigate("/");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token"); localStorage.removeItem("user");
        SetAuthToken(null); navigate("/login");
      } else if (error.request && !error.response) {
        console.warn("Network error — server may be waking up:", error.message);
      }
    }
  }, [setUser]);

  useEffect(() => {
    fetchUser();
    const goOffline = () => { setIsOnline(false); setUser(p => ({ ...p, onlineStatus: false })); };
    const goOnline = () => { setIsOnline(true); fetchUser(); };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => { window.removeEventListener("offline", goOffline); window.removeEventListener("online", goOnline); };
  }, [fetchUser]);

  return (
    /*
      Auth pages (login, signup, etc.): height = auto so the page scrolls freely.
      Chat pages: height = 100dvh so keyboard-resize works on mobile.
    */
    <div
      className={`flex flex-row ${hideSidebar ? '' : 'overflow-hidden'}`}
      style={hideSidebar
        ? { minHeight: '100dvh' }          // auth: scrollable
        : { height: '100dvh' }             // chat: fixed viewport
      }
    >
      {user?.id && !hideSidebar && <Navbar />}
      <div className={`flex-1 min-h-0 ${hideSidebar ? '' : 'overflow-hidden pb-16 md:pb-0'}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-otp" element={<VerificationCode />} />
          <Route path="/forget-password" element={<UpdateEmail />} />
          <Route path="/set-new-password" element={<SetPassword />} />
          <Route path="/" element={<ProtectedRoute element={<ChatRoom />} />} />
          <Route path="/friends/list" element={<ProtectedRoute element={<FrdConnection />} />} />
          <Route path="/friends/add-friend" element={<ProtectedRoute element={<SuggestionsFriend />} />} />
          <Route path="/friends/received-requests" element={<ProtectedRoute element={<ReceivedReq />} />} />
          <Route path="/friends/sent-requests" element={<ProtectedRoute element={<SentfrdReq />} />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <UserState>
        <FriendsState>
          <MessageState>
            <AppContent />
          </MessageState>
        </FriendsState>
      </UserState>
    </Router>
  );
}

export default App;
