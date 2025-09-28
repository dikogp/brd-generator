// firebase-init.js
// Using compatible Firebase SDK loaded via script tags

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmGsdOqFAxoeVV2SZ-SU3L37a9tL2qTEc",
  authDomain: "brd-generator-app-ce7a5.firebaseapp.com",
  projectId: "brd-generator-app-ce7a5",
  storageBucket: "brd-generator-app-ce7a5.firebasestorage.app",
  messagingSenderId: "1083919603735",
  appId: "1:1083919603735:web:124d11a271434971fa6452",
  measurementId: "G-GVMZ9HW0KL",
};

// This function will be called after Firebase SDK is loaded
function initializeFirebase() {
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");

  // Signal to the main app that Firebase is ready
  window.firebaseInitialized = true;

  // Dispatch an event that Firebase is ready
  document.dispatchEvent(new CustomEvent("firebaseReady"));
}

// This will be called by the main app after Firebase SDK is loaded
window.initializeFirebase = initializeFirebase;
