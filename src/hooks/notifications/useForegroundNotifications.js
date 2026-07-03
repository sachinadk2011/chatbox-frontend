import { useEffect, usecontect } from "react";
import { listenForegroundMessages, showChatNotificationFromFCM } from "../../utils/helpers/notifications";

export const useForegroundNotifications = () => {

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
}