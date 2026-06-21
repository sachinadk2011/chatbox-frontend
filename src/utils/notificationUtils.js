// module-level Map persists across calls - survives React re-renders
// senderId -> string[] (preview of each unread msg)
const pendingMsgMap = new Map();

/* Ask the user for the notification permisssion (call once on login) */
export const requestNotificationPermission = async () =>{
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return await Notification.requestPermission();
};

export const getNotificationStatus = () => {
     if (!('Notification' in window)) return 'unsupported';
     return Notification.permission; // default or granted or denied
};

const getPreview = (msg, types) =>{
    if (types === 'image')    return '📷 Photo';
  if (types === 'video')    return '🎥 Video';
  if (types === 'multiple') return '📎 Attachments';
  if (types === 'audio')    return '🎤 Audio';
  if (types === 'file')     return '📁 File';
  const text = msg ?? '';
  return text.length > 55 ? text.slice(0, 55) + '…' : text;
};

/**
 * Show a browser notification for a new chat message.
 * Clicking it fires a custom DOM event so App.jsx can navigate
 * without a page reload.
 */

export const showChatNotification = ({ senderName, message, types, senderId}) =>{
     if (!('Notification' in window)) return;
     if (Notification.permission !== 'granted') return;

     // Accumulate all messages from this sender
     const msg = pendingMsgMap.get(senderId) || [];
     msg.push(getPreview(message, types));
     pendingMsgMap.set(senderId, msg);

     const count = msg.length;

    // Build notification content
    const title = count > 1 ? `${senderName} · ${count} new messages`
    : senderName;

    // Show last 4 messages, with overflow hint if more
  const shown    = msg.slice(-4);
  const overflow = count - shown.length;
  const body     = [
    overflow > 0 ? `↑ ${overflow} earlier message${overflow > 1 ? 's' : ''}` : null,
    ...shown,
  ].filter(Boolean).join('\n');

      // ── Show (or REPLACE existing) notification ───────
  // Same `tag` = browser replaces the old one in-place with the new content
  // `renotify: true` = still plays sound/vibrates on each update
     const notification = new Notification(senderName, {
        body,
        icon: '/icon/android-chrome-192x192.png',
        badge: '/icon/favicon-32x32.png',
        tag: `chat-${senderId}`, // Unique tag for this chat
        renotify: true, // Replace existing notification with the same tag

     });

     notification.onclick = () =>{
        window.focus();
        notification.close();
        pendingMsgMap.delete(senderId); // clear the pending msg on click
        // custom event -> app.jsz listens and calls the navigate()- no page reload
        window.dispatchEvent(
            new CustomEvent('navigateToChat', { detail: {  senderId } })
        );
     };

};
/* call when user open chats - clear the accumulator so the 
next notification from this person starts fresh from 1 again.
*/
     export const clearNotificationsForSender = (senderId) => {
  if (!senderId) return;
  pendingMsgMap.delete(senderId);
};

     //setTimeout(() => notification.close(), 6000);
    


