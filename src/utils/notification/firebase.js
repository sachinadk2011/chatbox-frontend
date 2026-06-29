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
        if (permission === "granted") {
            const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration,
            });
          
            return currentToken;
        } else {
            console.log("Notification permission denied");
            return null;
        }
    } catch (error) {
        console.error("Error requesting notification permission or getting token:", error);
        console.error("Full error:", error);
console.error("Name:", error.name);
console.error("Message:", error.message);
console.error("Stack:", error.stack);
        return null;
    }
}