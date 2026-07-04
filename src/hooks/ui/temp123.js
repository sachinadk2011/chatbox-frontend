/**
 * useTabTitle.js
 *
 * PURPOSE:
 *   Keeps the browser tab title in sync with the number of unread messages.
 *
 * INPUTS:
 *   totalUnread — number from MessageContext.totalUnread
 *
 * OUTPUTS:
 *   none (side-effect only — writes to document.title)
 */

import { useEffect } from 'react';

const useTabTitle = (totalUnread) => {
  useEffect(() => {
    document.title =
      totalUnread > 0
        ? `(${totalUnread > 99 ? '99+' : totalUnread}) Chat Waves`
        : 'Chat Waves - Real-time Chat App';
  }, [totalUnread]);
};

export default useTabTitle;
