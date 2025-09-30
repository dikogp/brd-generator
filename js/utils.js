/**
 * Utility functions for BRD Generator
 */

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
}

/**
 * Sanitize filename for download
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFileName(filename) {
  return filename
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile
 */
function isMobile() {
  return window.innerWidth < 768;
}

/**
 * Show loading state
 * @param {HTMLElement} element - Element to show loading on
 */
function showLoading(element) {
  if (element) {
    element.classList.add("loading");
    element.disabled = true;
  }
}

/**
 * Hide loading state
 * @param {HTMLElement} element - Element to hide loading on
 */
function hideLoading(element) {
  if (element) {
    element.classList.remove("loading");
    element.disabled = false;
  }
}

// Make functions available globally
window.debounce = debounce;
window.formatDate = formatDate;
window.sanitizeFileName = sanitizeFileName;
window.generateUniqueId = generateUniqueId;
window.isMobile = isMobile;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
