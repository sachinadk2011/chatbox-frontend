import { useCallback } from 'react';


export const useAuthSession = ({AUTH_PAGES, navigate, setUser, SetAuthToken}) => {


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
  }, [setUser]);

}