// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { requestNotificationPermission } from "../notificationUtils";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

console.log("Messaging instance:", messaging);

export const GetfcmToken = async () => {
    try {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js");

const registration = await navigator.serviceWorker.ready;
        console.log("SW Registration:", registration);
        console.info("chekcing that vapidkey ", import.meta.env.VITE_FIREBASE_VAPID_KEY
            

        );
        const permission = await requestNotificationPermission();
        if (permission !== "granted") return { token: null, error: "permission_denied" };
        
            const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration,
            });
            if (!currentToken) {
                console.warn("No registration token available. Request permission to generate one.");
                return { token: null, error: "no_token" };
            }
          console.info("currentToken", currentToken);
            return { token: currentToken, error: null };
       
    } catch (error) {
       // Brave (and some hardened browsers) block Google's push service entirely
    if (error.name === "AbortError" || error.message?.includes("push service")) {
      console.warn(
        "Push notifications unavailable: this browser blocks Google's push service " +
        "(common in Brave). In-app/browser notifications will still work while the tab is open."
      );
      return { token: null, error: "push_service_blocked" };
    } 
      console.error("Error getting FCM token:", error);

    
    return { token: null, error: error.message || "unknown_error" };
  }
};

// ── NEW: foreground listener — fires ONLY when tab is open and focused ──
// This replaces the socket-based showChatNotification entirely.
export const listenForegroundMessages = (onMessageCallback) => {
  return onMessage(messaging, (payload) => {
    console.info("Foreground FCM message received:", payload);
    onMessageCallback(payload);
  });
};