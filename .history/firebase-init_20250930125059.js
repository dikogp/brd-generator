/**
 * Firebase Initialization for Local Development
 * In production, this will be replaced by the build pipeline
 */

function initializeFirebase() {
  try {
    // Check if Firebase is available
    if (typeof firebase === "undefined") {
      console.log("Firebase SDK not loaded");
      return false;
    }

    // For local development, Firebase is not initialized
    // The app will work in offline mode
    console.log("Firebase tidak diinisialisasi dalam mode lokal.");
    console.log("App will run in offline mode with localStorage only.");

    return false; // Return false to indicate Firebase is not available
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return false;
  }
}

// Initialize Firebase when script loads
initializeFirebase();

// Make function available globally
window.initializeFirebase = initializeFirebase;
