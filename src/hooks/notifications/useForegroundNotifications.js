/**
 * useForegroundNotifications.js
 *
 * PURPOSE:
 *   Listens for Firebase Cloud Messaging foreground messages and shows an
 *   in-app notification ONLY when the user is NOT already viewing that chat.
 *
 * INPUTS:
 *   { selectedUserRef } — ref from MessageContext pointing at the currently
 *                         open chat; checked synchronously so no stale closure.
 *
 * OUTPUTS:
 *   none (effect only — subscribes/unsubscribes on mount/unmount)
 *
 * DEPENDENCIES:
 *   utils/notification/firebase        — listenForegroundMessages()
 *   utils/notification/notificationUtils — showChatNotificationFromFCM()
 */

import { useEffect } from 'react';
import { listenForegroundMessages } from '../../utils/notification/firebase';
import { showChatNotificationFromFCM } from '../../utils/notification/notificationUtils';

export const useForegroundNotifications = ({ selectedUserRef }) => {
  
  useEffect(() => {
    const unsubscribe = listenForegroundMessages((payload) => {
      const senderId = payload.data?.senderId;
      console.info('Foreground FCM message:', senderId, payload);

      // Suppress the notification if the user is already viewing this chat
      if (selectedUserRef?.current?.receiverId?.toString() === senderId) return;

      showChatNotificationFromFCM(payload);
    });

    return () => unsubscribe?.();
  }, [selectedUserRef]);
};