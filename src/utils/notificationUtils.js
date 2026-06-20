

/* Ask the user for the notification permisssion (call once on login) */
export const requestNotificationPermission = async () =>{
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return await Notification.requestPermission();
};

/**
 * Show a browser notification for a new chat message.
 * Clicking it fires a custom DOM event so App.jsx can navigate
 * without a page reload.
 */

export const showChatNotification = ({ senderName, message, types, senderId}) =>{
     if (!('Notification' in window)) return;
     if (Notification.permission !== 'granted') return;

     // BUild a readable message preview
     let msgPreview = message ?? "";
     if (types === 'image') msgPreview = "sent a photo 📷 "
     else if (types === 'video') msgPreview = "sent a video 🎥"
     else if (types === 'multiple') msgPreview = "sent an attachment 📎"
     else if (types === 'audio') msgPreview = "sent an audio message 🎤"
     else if (types === 'file') msgPreview = "sent a file 📁"
     else if (msgPreview.length > 50 ) msgPreview = msgPreview.slice(0, 50) + "...";

     const notification = new Notification(senderName, {
        body: msgPreview,
        icon: '/icon/android-chrome-192x192.png',
        badge: '/icon/favicon-32x32.png',
        tag: `chat-${senderId}`, // Unique tag for this chat
        renotify: true, // Replace existing notification with the same tag

     });

     notification.onclick = () =>{
        window.focus();
        notification.close();
        // custom event -> app.jsz listens and calls the navigate()- no page reload
        window.dispatchEvent(
            new CustomEvent('navigateToChat', { detail: { senderId } })
        );
     };

     //setTimeout(() => notification.close(), 6000);
    


};