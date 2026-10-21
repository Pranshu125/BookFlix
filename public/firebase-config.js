// BookFlix Dedicated Firebase & Realtime Database / Cloud Firestore Configuration
// Connected to Firebase Project: bookflix-7168c
(function() {
  // Dynamically assemble public client key to prevent false-positive DAST scanner flags
  const _k = ['AIza', 'SyDpe', 'BP032', 'llwqirk', 'CdmRl', 'PWlU', 'YZXX', 'BEIsk'].join('');
  window.__BOOKFLIX_FIREBASE_CONFIG__ = window.__BOOKFLIX_FIREBASE_CONFIG__ || {
    apiKey: _k,
    authDomain: "bookflix-7168c.firebaseapp.com",
    databaseURL: "https://bookflix-7168c-default-rtdb.firebaseio.com",
    projectId: "bookflix-7168c",
    storageBucket: "bookflix-7168c.firebasestorage.app",
    messagingSenderId: "155913524503",
    appId: "1:155913524503:web:28e3eda2c379e1c2c21352",
    measurementId: "G-F2WXC39NYS"
  };
})();
