/**
 * Theme Manager for BRD Generator
 * Handles theme switching and persistence
 */

class ThemeManager {
  constructor() {
    this.currentTheme = "default";
    this.themes = {
      default: "Default Dark",
      light: "Light",
      blue: "Blue",
    };

    this.initializeTheme();
  }

  /**
   * Initialize theme system
   */
  initializeTheme() {
    // Load saved theme
    const savedTheme = this.getSavedTheme();
    this.applyTheme(savedTheme);

    // Setup theme change listeners
    this.setupThemeListeners();
  }

  /**
   * Setup theme change listeners
   */
  setupThemeListeners() {
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.applyTheme(e.target.value);
        }
      });
    });
  }

  /**
   * Apply theme to document
   */
  applyTheme(theme) {
    // Remove existing theme classes
    document.body.classList.remove("theme-light", "theme-blue");

    // Apply new theme
    if (theme === "light") {
      document.body.classList.add("theme-light");
    } else if (theme === "blue") {
      document.body.classList.add("theme-blue");
    }

    this.currentTheme = theme;

    // Update theme radio buttons
    this.updateThemeRadios(theme);

    console.log("Theme applied:", theme);
  }

  /**
   * Update theme radio buttons
   */
  updateThemeRadios(theme) {
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach((radio) => {
      radio.checked = radio.value === theme;
    });
  }

  /**
   * Save theme to storage
   */
  saveTheme(theme) {
    try {
      localStorage.setItem("theme", theme);
      this.applyTheme(theme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  }

  /**
   * Get saved theme
   */
  getSavedTheme() {
    try {
      return localStorage.getItem("theme") || "default";
    } catch (error) {
      console.error("Error getting saved theme:", error);
      return "default";
    }
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Get available themes
   */
  getAvailableThemes() {
    return this.themes;
  }
}

// Create and export theme manager instance
const themeManager = new ThemeManager();

// Make available globally
window.themeManager = themeManager;
