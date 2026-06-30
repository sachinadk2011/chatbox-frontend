import React, { useContext, useEffect, useCallback, useState } from 'react';
import './App.css';
import Login from './auth_pages/Login';
import {
  BrowserRouter as Router, Routes, Route,
  useNavigate, Navigate, useLocation, matchPath
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
import ErrorPage from './pages/ErrorPage';
import ServerWakingBanner from './component/ServerWakingBanner';
import { subscribeBackendStatus, getBackendStatus, isDevEnvironment, markBackendOnline } from './utils/backendStatus';
import { getTokenExpiry } from './utils/tokenUtils';
import axios from 'axios';
import { requestNotificationPermission} from './utils/notificationUtils';
import NotificationPrompt from './component/NotificationPrompt';
import {getDeviceId, getDeviceInfo } from './utils/userDeviceInfo';
import { listenForegroundMessages } from './utils/notification/firebase';
import { showChatNotificationFromFCM } from './utils/notificationUtils';

const EMPTY_USER = {
  receiverId: null, receiverName: '', senderId: null, senderName: '',
  lastActive: null, onlineStatus: false, profile_url: null,
};

console.info("app js: ", getDeviceInfo());

function ProtectedRoute({ element }) {
  const { user } = useContext(UserContext);
  return user?.id ? element : <Navigate to="/login" replace />;
}

function RootRedirect() {
  const { user } = useContext(UserContext);
  return <Navigate to={user?.id ? '/chats' : '/login'} replace />;
}

/**
 * StatusGate — checks backend/maintenance status and renders error pages.
 *
 * WHY a separate component?
 * React's Rules of Hooks: the SAME number of hooks must run on every render.
 * The original AppContent had early returns (offline/500/maintenance) that came
 * AFTER some hooks but BEFORE others (useCallback, useEffect for fetchUser, etc.).
 * When an error state triggered, React saw fewer hooks than the initial render
 * and crashed: "Rendered fewer hooks than expected".
 *
 * Fix: StatusGate has exactly 3 hooks (useState + 2x useEffect) with NO hooks
 * after its early returns — safe to return early from.
 * AppContent has all its hooks unconditionally — no status-based early returns.
 *
 * AUTO-RECOVERY:
 * When status !== 'online', StatusGate polls /api/auth/ping every 6 s.
 * On first success it calls markBackendOnline() — the status flips back,
 * StatusGate renders children, and React Router shows the user's original URL
 * automatically. No page reload, no navigation needed.
 */
const PING_URL = `${import.meta.env.VITE_URL || 'http://localhost:8000'}/api/auth/ping`;
const POLL_INTERVAL_MS = 6000; // poll every 6 seconds while in error state

const AUTH_ROUTES = ['/login', '/signup', '/verify-otp', '/forget-password', '/set-new-password'];

function StatusGate({ children }) {
  const location = useLocation();
  const [backendStatus, setBackendStatus] = useState(getBackendStatus);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const unsub = subscribeBackendStatus((status) => setBackendStatus(status));
    setBackendStatus(getBackendStatus()); // sync immediately
    return unsub;
  }, []);

  // ── Auto-poll /api/auth/ping while in any error state ──────────────────────
  // When ping succeeds, markBackendOnline() flips status back → children render
  // → React Router restores the user's original URL automatically.
  useEffect(() => {
    if (backendStatus === 'online') return; // no polling needed when healthy
    if (import.meta.env.VITE_MAINTENANCE_MODE === 'true') return; // maintenance: don't poll

    const ping = async () => {
      try {
        await axios.get(PING_URL, { timeout: 5000 });
        // ✅ Server is back — recover without page reload
        markBackendOnline();
      } catch {
        // still down — next interval will try again
      }
    };

    // First ping immediately so recovery is instant when server comes back
    ping();
    const id = setInterval(ping, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [backendStatus]);

  // ── Manual retry (Refresh button on the error page) ────────────────────────
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await axios.get(PING_URL, { timeout: 5000 });
      markBackendOnline(); // triggers re-render → children show automatically
    } catch {
      // server still down — keep showing error page, auto-poll continues
    } finally {
      setIsRetrying(false);
    }
  }, []);

  // ── Auth pages: never replace the login/signup form with an error page ──────
  // The form itself shows the server-sleeping state inline and auto-retries.
  // This keeps credentials in the form and gives a much better UX.
  if (AUTH_ROUTES.includes(location.pathname)) {
    return children;
  }

  // ── Maintenance mode — set VITE_MAINTENANCE_MODE=true in .env ──
  if (import.meta.env.VITE_MAINTENANCE_MODE === 'true') {
    return <ErrorPage type="maintenance" />;
  }

  // ── DEV: backend process completely unreachable (no response at all) ──
  // Prod uses ServerWakingBanner (non-blocking overlay) instead.
  if (isDevEnvironment() && backendStatus === 'offline') {
    return <ErrorPage type="offline" onRetry={handleRetry} isRetrying={isRetrying} />;
  }

  // ── 500/503 server error (DB down, crash, etc.) — shown in both dev & prod ──
  if (backendStatus === 'error500') {
    return <ErrorPage type="500" onRetry={handleRetry} isRetrying={isRetrying} />;
  }

  return children;
}

/**
 * AppContent — the actual app shell.
 * ALL hooks run unconditionally on every render (no status-based early returns).
 * Status/error page switching is handled entirely by the parent StatusGate.
 */
function AppContent() {
  const navigate = useNavigate();
  const { getUser, setUser, user, RefreshToken } = useContext(UserContext);
  const { selectedUserRef , setSelectedUser, totalUnread, markAsRead  } = useContext(MessageContext);
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine); // eslint-disable-line no-unused-vars

  // All valid route patterns in the app
  const KNOWN_ROUTES = [
    '/', '/login', '/signup', '/verify-otp', '/forget-password', '/set-new-password',
    '/chats', '/chats/v1/u/:userId',
    '/friends/list', '/friends/list/v1/u/:userId',
    '/friends/add-friend', '/friends/received-requests', '/friends/sent-requests',
  ];
  const is404 = !KNOWN_ROUTES.some(pattern => matchPath(pattern, location.pathname));

  const AUTH_PAGES = ['/login', '/signup', '/verify-otp', '/forget-password', '/set-new-password'];
  const hideSidebar = AUTH_PAGES.includes(location.pathname) || is404;

  // ── Close chat on ANY route change ──
  useEffect(() => {
    if (
      !location.pathname.startsWith('/chats/v1/u/') &&
      !location.pathname.startsWith('/friends/list/v1/u/')
    ) {
      setSelectedUser(prev => {
        if (!prev?.receiverId) return prev; // already empty — avoid re-render
        return EMPTY_USER;
      });
    }
  }, [location.pathname, setSelectedUser]);


// ── Update browser tab title with unread count ──
useEffect(() => {
  document.title = totalUnread > 0
    ? `(${totalUnread > 99 ? '99+' : totalUnread}) Chat Waves`
    : 'Chat Waves - Real-time Chat App';
}, [totalUnread]);

// inside AppContent, alongside your other useEffects:
useEffect(() => {
  const unsubscribe = listenForegroundMessages((payload) => {
    const senderId = payload.data?.senderId;
    console.info("app.js conetent foreground msg : ", senderId, " | payload: ", payload);
    // Don't show if user is already viewing this chat
    if (selectedUserRef?.current?.receiverId?.toString() === senderId) return;
    showChatNotificationFromFCM(payload);
  });
  return () => unsubscribe?.();
}, [selectedUserRef ]);

// ── Bridge service worker postMessage → same custom event the rest of the app listens for ──
useEffect(() => {
  if (!('serviceWorker' in navigator)) return;

  const handler = (event) => {
    console.info('Message from service worker:', event.data);
    if (event.data?.type === 'navigateToChat' && event.data?.senderId) {
      window.dispatchEvent(
        new CustomEvent('navigateToChat', { detail: { senderId: event.data.senderId } })
      );
    }
  };

  navigator.serviceWorker.addEventListener('message', handler);
  return () => navigator.serviceWorker.removeEventListener('message', handler);
}, []);

// ── Handle notification click → navigate to that chat (no page reload) ──
useEffect(() => {
  const handler = (e) => {
    console.info('Notification click event received:', e);
    markAsRead(e.detail.senderId);
    navigate(`/chats/v1/u/${e.detail.senderId}`);}
  window.addEventListener('navigateToChat', handler);
  return () => window.removeEventListener('navigateToChat', handler);
}, [navigate]);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    SetAuthToken(token);
    try {
      const userData = await getUser();
      if (userData.success) {
        setUser({
          name: userData.user.name,
          email: userData.user.email,
          id: userData.user.id,
          onlineStatus: userData.user.onlineStatus,
          lastActive: userData.user.lastActive,
          profile_Url: userData.user.profile_Url,
          public_id: userData.user.public_id,
        });
        // ✅ Only redirect if on a page that has nothing to show logged-in users
      const currentPath = window.location.pathname;
      const isAuthPage = [...AUTH_PAGES, '/'].includes(currentPath);
      if (isAuthPage) {
        // Respect ?redirect= param (e.g. from portfolio ChatWaves button)
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirect') || '/chats';
        navigate(redirectTo);
      }
      // If already at /chats/v1/u/abc123 or /friends/list — stay exactly there
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Real auth failure — clear session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        SetAuthToken(null);
        navigate('/login');
      }
      // Network error / 5xx → StatusGate shows appropriate error page.
      // Do NOT logout — session stays valid when server recovers.
    }
  }, [setUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchUser();
    const goOffline = () => { setIsOnline(false); setUser(p => ({ ...p, onlineStatus: false })); };
    const goOnline  = () => { setIsOnline(true);  fetchUser(); };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online',  goOnline);
    };
  }, [fetchUser]);

  // ── Proactive token refresh — fires 2 min before expiry ──
  useEffect(() => {
    if (!user?.id) return;

    const schedule = () => {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const expiry = getTokenExpiry(token);
      if (!expiry) return null;

      const msUntilRefresh = expiry - Date.now() - 2 * 60 * 1000;

      if (msUntilRefresh <= 0) {
        RefreshToken(getDeviceId())
          .then(newToken => {
            localStorage.setItem('token', newToken);
            SetAuthToken(newToken);
            schedule();
          })
          .catch(err => {
            if (err?.response?.status) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            } else {
              console.warn('Token refresh failed — server may be sleeping. Will retry.');
            }
          });
        return null;
      }

      console.log(`Token refreshes in ${Math.round(msUntilRefresh / 1000 / 60)} minutes`);
      return setTimeout(async () => {
        try {
          const newToken = await RefreshToken(getDeviceId());
          localStorage.setItem('token', newToken);
          SetAuthToken(newToken);
          schedule();
        } catch (err) {
          if (err?.response?.status) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          } else {
            console.warn('Token refresh failed — server may be sleeping. Will retry.');
            setTimeout(() => schedule(), 15_000);
          }
        }
      }, msUntilRefresh);
    };

    const timer = schedule();
    return () => { if (timer) clearTimeout(timer); };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`flex flex-row ${hideSidebar ? '' : 'overflow-hidden'}`}
      style={
        hideSidebar
          ? { minHeight: '100dvh' }   // auth pages: scrollable
          : { height: '100dvh' }      // chat pages: fixed viewport
      }
    >
      {user?.id && !hideSidebar &&
        <>
        <Navbar />
        <NotificationPrompt />
        </>
    }
      

      {/* Prod/non-dev: non-blocking sleeping overlay for Render cold-starts */}
      {!isDevEnvironment() && <ServerWakingBanner />}

      <div className={`flex-1 min-h-0 ${hideSidebar ? '' : 'overflow-hidden pb-16 md:pb-0'}`}>
        <Routes>
          <Route path="/"                      element={<RootRedirect />} />
          <Route path="/login"                 element={<Login />} />
          <Route path="/signup"                element={<SignUp />} />
          <Route path="/verify-otp"            element={<VerificationCode />} />
          <Route path="/forget-password"       element={<UpdateEmail />} />
          <Route path="/set-new-password"      element={<SetPassword />} />

          <Route path="/chats"                 element={<ProtectedRoute element={<ChatRoom />} />} />
          <Route path="/chats/v1/u/:userId"    element={<ProtectedRoute element={<ChatRoom />} />} />

          <Route path="/friends/list"                    element={<ProtectedRoute element={<FrdConnection />} />} />
          <Route path="/friends/list/v1/u/:userId"       element={<ProtectedRoute element={<FrdConnection />} />} />
          <Route path="/friends/add-friend"              element={<ProtectedRoute element={<SuggestionsFriend />} />} />
          <Route path="/friends/received-requests"       element={<ProtectedRoute element={<ReceivedReq />} />} />
          <Route path="/friends/sent-requests"           element={<ProtectedRoute element={<SentfrdReq />} />} />

          <Route path="*" element={<ErrorPage type="404" />} />
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
            {/*
              StatusGate wraps AppContent so all error-page early returns happen
              in a component with NO hooks defined after those returns.
              AppContent never returns early — all its hooks always run.
            */}
            <StatusGate>
              <AppContent />
            </StatusGate>
          </MessageState>
        </FriendsState>
      </UserState>
    </Router>
  );
}

export default App;
