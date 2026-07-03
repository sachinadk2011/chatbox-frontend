import { useEffect, useContext } from 'react';
import { markAsRead } from '../../utils/helpers/notifications';
import { useNavigate } from 'react-router-dom';
import { UserState } from '../../context/users/UserState';


export const useNotificationBridge = () =>{
    const { Selecteduser } = useContext(UserState);
    const navigate = useNavigate();

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

    useEffect(() => {
      const handler = (e) => {
        console.info('Notification click event received:', e);
        markAsRead(e.detail.senderId);
        navigate(`/chats/v1/u/${e.detail.senderId}`);}
      window.addEventListener('navigateToChat', handler);
      return () => window.removeEventListener('navigateToChat', handler);
    }, [navigate, Selecteduser?.receiverId]);
}