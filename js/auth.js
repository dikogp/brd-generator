/**
 * Authentication Manager for BRD Generator
 * Handles Firebase authentication
 */

class AuthManager {
  constructor() {
    this.auth = null;
    this.currentUser = null;
    this.authStateListeners = [];

    this.initializeAuth();
  }

  /**
   * Initialize authentication
   */
  initializeAuth() {
    try {
      if (typeof firebase !== "undefined" && firebase.auth) {
        this.auth = firebase.auth();

        // Setup auth state listener
        this.auth.onAuthStateChanged((user) => {
          this.currentUser = user;
          this.notifyAuthStateChange(user);
        });

        console.log("Auth manager initialized");
      } else {
        console.log("Firebase auth not available");
      }
    } catch (error) {
      console.warn("Auth initialization failed:", error);
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    if (!this.auth) {
      throw new Error("Authentication not available");
    }

    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");

      const result = await this.auth.signInWithPopup(provider);
      console.log("Google sign-in successful:", result.user.displayName);

      return result.user;
    } catch (error) {
      console.error("Google sign-in failed:", error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    if (!this.auth || !this.currentUser) {
      return;
    }

    try {
      await this.auth.signOut();
      console.log("Sign-out successful");
    } catch (error) {
      console.error("Sign-out failed:", error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Add auth state change listener
   */
  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
  }

  /**
   * Notify all listeners of auth state change
   */
  notifyAuthStateChange(user) {
    this.authStateListeners.forEach((listener) => {
      try {
        listener(user);
      } catch (error) {
        console.error("Auth state listener error:", error);
      }
    });
  }
}

// Create and export auth manager instance
const authManager = new AuthManager();

// Make available globally
window.authManager = authManager;
