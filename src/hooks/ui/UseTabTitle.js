import { useEffect } from 'react';

/**
 * Syncs the browser tab title with unread message count.
 * @param {number} totalUnread
 */
const useTabTitle = (totalUnread) => {
  useEffect(() => {
    document.title = totalUnread > 0
      ? `(${totalUnread > 99 ? '99+' : totalUnread}) Chat Waves`
      : 'Chat Waves - Real-time Chat App';
  }, [totalUnread]);
};

export default useTabTitle;