
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

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);

  const { title, body } = payload.notification || {};
  const { senderId } = payload.data || {};

  self.registration.showNotification(title || "New Message", {
    body: body || "You have a new message",
    icon: "https://res.cloudinary.com/df4pswtdc/image/upload/w_100,h_100,c_fit/chat_waves%20logo/vyxmokk7tiorkopsxlei.png",
    badge: "https://res.cloudinary.com/df4pswtdc/image/upload/w_100,h_100,c_fit/chat_waves%20logo/vyxmokk7tiorkopsxlei.png",
    tag: `chat-${senderId}`,        // groups notifications per sender
    renotify: true,
    data: { senderId },
  });
});

// Click on notification → open/focus the chat tab
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const senderId = event.notification.data?.senderId;
  const url = senderId
    ? `${self.location.origin}/chat/${senderId}`
    : self.location.origin;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});