import { getToken, onMessage } from "firebase/messaging";
import { messaging as getFCM } from "./clientApp";

export const requestNotificationPermission = async (userId?: string) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    const messaging = await getFCM();
    if (!messaging) return null;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (token) {
      // Send token to backend
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token, 
          userId,
          preferences: {
            allEvents: true,
            launches: true,
          }
        }),
      });
      return token;
    }
  } catch (error) {
    console.error("Error getting notification token:", error);
  }
  return null;
};

export const onMessageListener = async () => {
  const messaging = await getFCM();
  if (!messaging) return;
  
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};
