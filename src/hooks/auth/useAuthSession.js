/**
 * useAuthSession.js
 *
 * PURPOSE:
 *   Fetches the current user on app load, updates user state on success, and
 *   listens for browser online/offline events to keep the user's onlineStatus
 *   in sync — all without touching the component.
 *
 * INPUTS:
 *   { getUser, setUser, navigate }
 *     getUser  — context function that calls GET /api/auth/getuser
 *     setUser  — context setter for the user object
 *     navigate — from useNavigate()
 *
 * OUTPUTS:
 *   { fetchUser } — exposed so the parent component can call it imperatively
 *                   (e.g. after a successful login).
 *
 * DEPENDENCIES:
 *   utils/auth/SetAuthToken — attaches the token to Axios defaults
 */

import { useCallback, useEffect } from 'react';
import SetAuthToken from '../../utils/auth/SetAuthToken';
import { AUTH_PAGES } from '../../constants/routes';

export const useAuthSession = ({ getUser, setUser, navigate }) => {

  // fetchUser is returned so callers can also trigger it on-demand (e.g. after
  // a network-online event).  Dependency array is intentionally minimal —
  // navigate and AUTH_PAGES never change; only setUser matters.
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    SetAuthToken(token);

    try {
      const userData = await getUser();

      if (userData.success) {
        setUser({
          name:          userData.user.name,
          email:         userData.user.email,
          id:            userData.user.id,
          onlineStatus:  userData.user.onlineStatus,
          lastActive:    userData.user.lastActive,
          profile_Url:   userData.user.profile_Url,
          public_id:     userData.user.public_id,
        });

        // Only redirect if the user is on an auth-only page (login, signup, etc.)
        // If they're already at /chats/v1/u/abc or /friends/list — leave them there.
        const currentPath = window.location.pathname;
        if ([...AUTH_PAGES, '/'].includes(currentPath)) {
          const params     = new URLSearchParams(window.location.search);
          const redirectTo = params.get('redirect') || '/chats';
          navigate(redirectTo);
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Real auth failure — clear the session and send to login.
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        SetAuthToken(null);
        navigate('/login');
      }
      // Network error / 5xx → StatusGate shows the appropriate error page.
      // Do NOT logout here — the session is still valid when the server recovers.
    }
  }, [setUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // Run once on mount; also re-run when the browser comes back online.
  useEffect(() => {
    fetchUser();

    const goOffline = () => setUser(prev => ({ ...prev, onlineStatus: false }));
    const goOnline  = () => fetchUser();

    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online',  goOnline);
    };
  }, [fetchUser]);

  return { fetchUser };
};