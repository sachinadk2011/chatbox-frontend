
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

firebase.initializeApp({
   apiKey: "AIzaSyAwlhaH_bySDtTRDnom6ZPnkW6Dfk4-hHw",
  authDomain: "chat-box-db254.firebaseapp.com",
  projectId: "chat-box-db254",
  storageBucket: "chat-box-db254.firebasestorage.app",
  messagingSenderId: "399443077848",
  appId: "1:399443077848:web:2d020a1825c25ebb1b45ad",
  measurementId: "G-JXJGY101EV"
});

const messaging = firebase.messaging();

// ── Background message handler ──
// Payload is data-only now — accumulate messages by reading the
// previous notification's stored `data.messages` array (survives SW restarts
// as long as the notification is still visible/un-clicked).
messaging.onBackgroundMessage(async (payload) => {
  console.log("Background message received:", payload);

  const { senderId, senderName, preview } = payload.data || {};
  if (!senderId) return;

  const tag = `chat-${senderId}`;

  // Look for an existing notification with the same tag
  const existing = await self.registration.getNotifications({ tag });
  let messages = [];
  if (existing.length > 0 && Array.isArray(existing[0].data?.messages)) {
    messages = existing[0].data.messages;
  }

  messages.push(preview || "New message");

  const count = messages.length;
  const shown = messages.slice(-4);
  const overflow = count - shown.length;
  const body = [
    overflow > 0 ? `↑ ${overflow} earlier message${overflow > 1 ? 's' : ''}` : null,
    ...shown,
  ].filter(Boolean).join('\n');

  const title = count > 1
    ? `${senderName || 'Someone'} · ${count} new messages`
    : (senderName || 'Someone');

  self.registration.showNotification(title, {
    body,
    icon: "https://res.cloudinary.com/df4pswtdc/image/upload/w_100,h_100,c_fit/chat_waves%20logo/vyxmokk7tiorkopsxlei.png",
    badge: "https://res.cloudinary.com/df4pswtdc/image/upload/w_100,h_100,c_fit/chat_waves%20logo/vyxmokk7tiorkopsxlei.png",
    tag,
    renotify: true,
    data: { senderId, messages }, // persisted for the NEXT push event
  });
});

// Click on notification → open/focus the chat tab, clear stacked messages
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const senderId = event.notification.data?.senderId;
  console.info("Notification click for senderId:", senderId);
  const url = senderId
    ? `${self.location.origin}/chats/v1/u/${senderId}`
    : self.location.origin;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.postMessage({ type: "navigateToChat", senderId });
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});