import { useEffect } from 'react';
import { RefreshToken, getTokenExpiry } from '../../utils/auth';
import { getDeviceId } from '../../utils/helpers/userDeviceInfo';


export const useAuthSession = () => {

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
  }, [user?.id]); 
}