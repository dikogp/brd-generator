/**
 * Theme management functions
 */

let currentTheme = localStorage.getItem("theme") || "default";

/**
 * Initialize theme settings from localStorage
 */
function initializeTheme() {
  applyTheme(currentTheme);

  // Set the radio button for current theme
  const themeRadio = document.querySelector(
    `input[name="theme"][value="${currentTheme}"]`
  );
  if (themeRadio) {
    themeRadio.checked = true;
  }

  // Add event listener for theme save button
  const saveThemeBtn = document.getElementById("btn-save-theme");
  if (saveThemeBtn) {
    saveThemeBtn.addEventListener("click", saveTheme);
  }
}

/**
 * Save selected theme
 */
function saveTheme() {
  const selectedTheme = document.querySelector(
    'input[name="theme"]:checked'
  )?.value;
  if (selectedTheme) {
    applyTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
    currentTheme = selectedTheme;
    showToast("Tema berhasil diubah!", "success");
  }
}

/**
 * Apply selected theme to document
 * @param {string} theme - Theme name: 'default', 'light', or 'blue'
 */
function applyTheme(theme) {
  document.body.classList.remove("theme-light", "theme-blue");

  if (theme === "light") {
    document.body.classList.add("theme-light");
  } else if (theme === "blue") {
    document.body.classList.add("theme-blue");
  }

  // Update meta theme-color for mobile browsers
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute(
      "content",
      theme === "light" ? "#ffffff" : theme === "blue" ? "#0c4a6e" : "#1f2937"
    );
  }
}
