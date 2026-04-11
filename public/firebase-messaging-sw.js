importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Must match clientApp.ts
firebase.initializeApp({
  apiKey: "AIzaSyAnrYkKDLOg87mC55isakzJiVEE1asdRcg",
  authDomain: "elara-d93a2.firebaseapp.com",
  projectId: "elara-d93a2",
  storageBucket: "elara-d93a2.firebasestorage.app",
  messagingSenderId: "819964988580",
  appId: "1:819964988580:web:b9aa8bdabd6b8fa20fea31"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
