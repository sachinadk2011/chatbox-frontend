import React, { useContext, useEffect, useCallback, useState } from 'react';
import './App.css';
import Login from './pages/auth/Login';
import {
  BrowserRouter as Router, Routes, Route,
  useNavigate, Navigate, useLocation, matchPath
} from "react-router-dom";
import SignUp from './pages/auth/SignUp';
import ChatRoom from './pages/ChatRoom';
import { UserState } from './context/users/UserState';
import { MessageState } from './context/message/MessageState';
import { FriendsState } from './context/friends/FriendsState';
import UserContext from './context/users/UserContext';
import MessageContext from './context/message/MessageContext';
import SelectedUserContext from './context/message/SelectedUserContext';
import socket from './services/socket';
import FrdConnection from './pages/FrdConnection';
import SuggestionsFriend from './component/friends/SuggestionFriend';
import Navbar from './component/layout/Navbar';
import ReceivedReq from './component/friends/ReceivedReq';
import SentfrdReq from './component/friends/SentfrdReq';
import VerificationCode from './pages/auth/VerifyOtpCode';
import UpdateEmail from './pages/auth/UpdateEmail';
import SetPassword from './pages/auth/SetPassword';
import ErrorPage from './pages/ErrorPage';
import ServerWakingBanner from './component/ui/ServerWakingBanner';
import { subscribeBackendStatus, getBackendStatus, isDevEnvironment, markBackendOnline } from './utils/helpers/backendStatus';
import { KNOWN_ROUTES, AUTH_PAGES } from './constants/routes';
import { api } from './utils/auth/SetAuthToken';
import NotificationPrompt from './component/notifications/NotificationPrompt';
import { getDeviceInfo } from './utils/helpers/userDeviceInfo';
import { EMPTY_USER } from './constants/user';
// Custom hooks
import { useAuthSession }              from './hooks/auth/useAuthSession';
import { useTokenRefresh }             from './hooks/auth/useTokenRefresh';
import { useForegroundNotifications } from './hooks/notifications/useForegroundNotifications';
import { useNotificationBridge }      from './hooks/notifications/useNotificationBridge';
import useTabTitle                    from './hooks/ui/useTabTitle';


// EMPTY_USER is now imported from constants/user.js

console.info("app js: ", getDeviceInfo());

function ProtectedRoute({ element }) {
  const { user } = useContext(UserContext);
  const location = useLocation();

  return user?.id ? element : <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
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

const POLL_INTERVAL_MS = 6000; // poll every 6 seconds while in error state

const AUTH_ROUTES = AUTH_PAGES ;

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
        await api.get("/api/auth/ping", { timeout: 5000 });
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
      await api.get(PING_URL, { timeout: 5000 });
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
  const { selectedUserRef, Selecteduser, setSelectedUser } = useContext(SelectedUserContext);
  const { totalUnread, markAsRead } = useContext(MessageContext);
  const location = useLocation();

  // All valid route patterns in the app
  
  const is404 = !KNOWN_ROUTES.some(pattern => matchPath(pattern, location.pathname));

 
  const hideSidebar = AUTH_PAGES.includes(location.pathname) || is404;

  // ── Close chat on ANY route change ──────────────────────────────────────
  // Kept inline: this is routing logic specific to AppContent, not reusable.
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

  // ── Custom hooks (replaced the 5 inline useEffect / useCallback blocks) ──
  useAuthSession({ getUser, setUser, navigate });
  useTokenRefresh({ user, RefreshToken, navigate });
  useForegroundNotifications({ selectedUserRef });
  useNotificationBridge({ markAsRead, receiverId: Selecteduser?.receiverId });
  useTabTitle(totalUnread);

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
