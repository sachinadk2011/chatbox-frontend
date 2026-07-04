/**
 * useTokenRefresh.js
 *
 * PURPOSE:
 *   Schedules a proactive JWT access-token refresh 2 minutes before the current
 *   token expires.  On success it updates localStorage and Axios defaults.
 *   On failure it distinguishes between a real auth error (→ logout) and a
 *   transient server-sleep (→ retry in 15 s).
 *
 * INPUTS:
 *   { user, RefreshToken, navigate }
 *     user         — from UserContext (used only for user.id to gate the effect)
 *     RefreshToken — context function that calls POST /api/auth/token
 *     navigate     — from useNavigate()
 *
 * OUTPUTS:
 *   none (effect only)
 *
 * DEPENDENCIES:
 *   utils/auth/tokenUtils      — getTokenExpiry()
 *   utils/auth/SetAuthToken    — SetAuthToken()
 *   utils/helpers/userDeviceInfo — getDeviceId()
 */

import { useEffect } from 'react';
import { getTokenExpiry } from '../../utils/auth/tokenUtils';
import SetAuthToken from '../../utils/auth/SetAuthToken';
import { getDeviceId } from '../../utils/helpers/userDeviceInfo';

export const useTokenRefresh = ({ user, RefreshToken, navigate }) => {

  useEffect(() => {
    if (!user?.id) return;

    const schedule = () => {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const expiry = getTokenExpiry(token);
      if (!expiry) return null;

      // Refresh 2 minutes before actual expiry
      const msUntilRefresh = expiry - Date.now() - 2 * 60 * 1000;

      const onRefreshError = (err) => {
        if (err?.response?.status) {
          // Real auth rejection — logout
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          // Server may be sleeping — retry silently
          console.warn('Token refresh failed — server may be sleeping. Will retry.');
          setTimeout(() => schedule(), 15_000);
        }
      };

      const doRefresh = async () => {
        try {
          const newToken = await RefreshToken(getDeviceId());
          localStorage.setItem('token', newToken);
          SetAuthToken(newToken);
          schedule(); // schedule the next refresh
        } catch (err) {
          onRefreshError(err);
        }
      };

      // If already past the refresh window, refresh immediately
      if (msUntilRefresh <= 0) {
        doRefresh();
        return null;
      }

      console.log(`Token refreshes in ${Math.round(msUntilRefresh / 1000 / 60)} minutes`);
      return setTimeout(doRefresh, msUntilRefresh);
    };

    const timer = schedule();
    return () => { if (timer) clearTimeout(timer); };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
};