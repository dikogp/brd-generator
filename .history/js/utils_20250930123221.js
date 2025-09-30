/**
 * Utility functions for BRD Generator
 */

/**
 * Shows a toast notification message
 * @param {string} message - The message to show
 * @param {string} type - "success" or "error"
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = "success", duration = 4000) {
  try {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.className =
        "fixed bottom-4 right-4 z-50 flex flex-col gap-2";
      document.body.appendChild(toastContainer);
    }

    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add("fade-out");
        setTimeout(() => {
          if (toast.parentElement) {
            toastContainer.removeChild(toast);
          }
        }, 300);
      }
    }, duration);
  } catch (error) {
    console.error("Error showing toast:", error);
  }
}

/**
 * Shows error toast message
 * @param {Error|string} error - Error object or message
 */
function showError(error) {
  console.error("BRD Generator Error:", error);
  showToast(typeof error === "string" ? error : error.message, "error");
}

/**
 * Format date function
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  try {
    if (!dateString) return "-";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
}

/**
 * Helper function to safely insert elements
 * @param {HTMLElement} newNode - Node to insert
 * @param {HTMLElement} referenceNode - Reference node
 * @returns {boolean} Success status
 */
function safeInsertBefore(newNode, referenceNode) {
  try {
    if (referenceNode && referenceNode.parentNode) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode);
      return true;
    } else {
      console.warn("Reference node or its parent not found for insertBefore");
      document.body.appendChild(newNode);
      return false;
    }
  } catch (error) {
    console.error("Error in safeInsertBefore:", error);
    try {
      document.body.appendChild(newNode);
    } catch (e) {
      console.error("Failed to append to body:", e);
    }
    return false;
  }
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Check if Firebase is available and configured
 * @returns {boolean} Firebase availability status
 */
function isFirebaseAvailable() {
  return typeof firebase !== "undefined" && firebase.app;
}
