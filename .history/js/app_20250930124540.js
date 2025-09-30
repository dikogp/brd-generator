/**
 * Main Application Controller for BRD Generator
 * Handles app initialization, navigation, and coordination between components
 */

class BRDApp {
  constructor() {
    this.currentUser = null;
    this.currentUserMode = "anonymous";
    this.currentPage = "main-menu";
    this.isInitialized = false;

    // Page elements cache
    this.pages = {};

    // Event listeners cache
    this.eventListeners = new Map();

    // Initialize when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.initialize());
    } else {
      this.initialize();
    }
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      console.log("Initializing BRD Generator App...");

      // Cache page elements
      this.cachePageElements();

      // Initialize Firebase
      await this.initializeFirebase();

      // Initialize components
      this.initializeComponents();

      // Setup global event listeners
      this.setupGlobalEventListeners();

      // Setup navigation
      this.setupNavigation();

      // Initialize theme
      this.initializeTheme();

      // Check authentication state
      this.initializeAuth();

      // Show initial page
      this.showMainMenu();

      // Mark as initialized
      this.isInitialized = true;

      console.log("BRD Generator App initialized successfully");
    } catch (error) {
      console.error("Error initializing app:", error);
      this.showError("Error initializing application: " + error.message);
    }
  }

  /**
   * Cache page elements for performance
   */
  cachePageElements() {
    this.pages = {
      mainMenu: document.getElementById("main-menu"),
      brdList: document.getElementById("brd-list-page"),
      brdPreview: document.getElementById("brd-preview-page"),
      wizard: document.getElementById("wizard-container"),
      settings: document.getElementById("settings-page"),
    };

    // Cache commonly used elements
    this.elements = {
      headerAuth: document.getElementById("header-auth-container"),
      toastContainer: document.getElementById("toast-container"),
      loadingOverlay: document.getElementById("loading-overlay"),
      sidebar: document.getElementById("sidebar-nav"),
      brdForm: document.getElementById("brd-form"),
      previewContent: document.getElementById("preview-content"),
      brdListContainer: document.getElementById("brd-list-container"),
    };

    // Create toast container if it doesn't exist
    if (!this.elements.toastContainer) {
      this.elements.toastContainer = this.createToastContainer();
    }
  }

  /**
   * Create toast container element
   */
  createToastContainer() {
    const container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed top-4 right-4 z-50 space-y-2";
    document.body.appendChild(container);
    return container;
  }

  /**
   * Initialize Firebase
   */
  async initializeFirebase() {
    try {
      if (typeof initializeFirebase === "function") {
        const initialized = initializeFirebase();
        if (initialized && typeof firebase !== "undefined") {
          // Setup auth state listener
          firebase.auth().onAuthStateChanged((user) => {
            this.currentUser = user;
            this.currentUserMode = user
              ? "authenticated"
              : storage.getUserMode() === "guest"
              ? "guest"
              : "anonymous";

            this.updateAuthUI();

            // Migrate local data when user signs in
            if (user && storage.getUserMode() !== "guest") {
              this.migrateLocalData();
            }
          });

          console.log("Firebase initialized successfully");
        }
      } else {
        console.log(
          "Firebase initialization function not available, running in offline mode"
        );
      }
    } catch (error) {
      console.warn(
        "Firebase initialization failed, continuing in offline mode:",
        error
      );
    }
  }

  /**
   * Initialize app components
   */
  initializeComponents() {
    // Ensure all components are available
    if (typeof storage === "undefined") {
      console.error("Storage component not loaded");
    }

    if (typeof formGenerator === "undefined") {
      console.error("Form generator component not loaded");
    }

    if (typeof pdfGenerator === "undefined") {
      console.error("PDF generator component not loaded");
    }
  }

  /**
   * Setup global event listeners
   */
  setupGlobalEventListeners() {
    // Prevent form submission on Enter key in certain contexts
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Enter" &&
        e.target.tagName !== "TEXTAREA" &&
        e.target.type !== "submit"
      ) {
        // Allow Enter in textareas and submit buttons
        if (this.currentPage === "wizard") {
          e.preventDefault();
        }
      }
    });

    // Handle browser back/forward
    window.addEventListener("popstate", (e) => {
      if (e.state && e.state.page) {
        this.navigateToPage(e.state.page, false);
      }
    });

    // Handle window resize
    window.addEventListener(
      "resize",
      this.debounce(() => {
        this.handleWindowResize();
      }, 250)
    );

    // Handle visibility change (tab focus/blur)
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.isInitialized) {
        this.onAppFocus();
      }
    });

    // Handle online/offline status
    window.addEventListener("online", () => {
      this.showToast("Connection restored", "success");
    });

    window.addEventListener("offline", () => {
      this.showToast("Working offline", "info");
    });
  }

  /**
   * Setup navigation event listeners
   */
  setupNavigation() {
    // Main menu buttons
    this.addEventListenerSafe("btn-new-brd", "click", () => {
      this.showWizard("new");
    });

    this.addEventListenerSafe("btn-edit-brd", "click", () => {
      this.showBRDList("edit");
    });

    this.addEventListenerSafe("btn-preview-brd", "click", () => {
      this.showBRDList("preview");
    });

    this.addEventListenerSafe("btn-settings", "click", () => {
      this.showSettings();
    });

    // Navigation buttons
    this.addEventListenerSafe("btn-back-from-settings", "click", () => {
      this.showMainMenu();
    });

    this.addEventListenerSafe("btn-back-to-list", "click", () => {
      this.showBRDList("preview");
    });

    this.addEventListenerSafe("btn-home-from-wizard", "click", () => {
      if (
        confirm(
          "Are you sure you want to return to the main menu? Unsaved changes will be lost."
        )
      ) {
        this.showMainMenu();
      }
    });

    // Settings buttons
    this.addEventListenerSafe("btn-guest-login", "click", () => {
      this.setGuestMode();
    });

    this.addEventListenerSafe("btn-save-theme", "click", () => {
      this.saveThemeSettings();
    });

    // PDF download
    this.addEventListenerSafe("btn-download-pdf", "click", () => {
      this.downloadCurrentPDF();
    });
  }

  /**
   * Safely add event listener with error handling
   */
  addEventListenerSafe(elementId, event, handler) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener(event, handler);
      this.eventListeners.set(elementId + "-" + event, {
        element,
        event,
        handler,
      });
    } else {
      console.warn(`Element with ID '${elementId}' not found`);
    }
  }

  /**
   * Initialize theme system
   */
  initializeTheme() {
    const savedTheme = storage.getSavedTheme();
    this.applyTheme(savedTheme);

    // Set theme radio buttons
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach((radio) => {
      if (radio.value === savedTheme) {
        radio.checked = true;
      }
    });
  }

  /**
   * Apply theme to document
   */
  applyTheme(theme) {
    document.body.classList.remove("theme-light", "theme-blue");

    if (theme === "light") {
      document.body.classList.add("theme-light");
    } else if (theme === "blue") {
      document.body.classList.add("theme-blue");
    }

    // Store current theme
    this.currentTheme = theme;
  }

  /**
   * Save theme settings
   */
  saveThemeSettings() {
    const selectedTheme = document.querySelector(
      'input[name="theme"]:checked'
    )?.value;
    if (selectedTheme) {
      this.applyTheme(selectedTheme);
      storage.saveTheme(selectedTheme);
      this.showToast("Theme saved successfully!", "success");
    }
  }

  /**
   * Initialize authentication state
   */
  initializeAuth() {
    if (this.currentUser) {
      this.currentUserMode = "authenticated";
    } else if (storage.getUserMode() === "guest") {
      this.currentUserMode = "guest";
    } else {
      this.currentUserMode = "anonymous";
    }

    this.updateAuthUI();
  }

  /**
   * Update authentication UI
   */
  updateAuthUI() {
    if (!this.elements.headerAuth) return;

    if (this.currentUser) {
      this.renderAuthenticatedUser();
    } else if (this.currentUserMode === "guest") {
      this.renderGuestUser();
    } else {
      this.renderAnonymousUser();
    }
  }

  /**
   * Render authenticated user UI
   */
  renderAuthenticatedUser() {
    this.elements.headerAuth.innerHTML = `
      <div class="user-menu" id="user-menu">
        <div class="flex items-center cursor-pointer px-3 py-1 rounded hover:bg-gray-700" id="user-menu-trigger">
          <img src="${
            this.currentUser.photoURL ||
            "https://img.icons8.com/fluency/96/user-male-circle.png"
          }" 
               alt="Profile" class="w-8 h-8 rounded-full mr-2 border border-blue-400">
          <span class="mr-1 text-sm hidden sm:inline">${
            this.currentUser.displayName || this.currentUser.email || "User"
          }</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="user-menu-dropdown">
          <div class="user-info-container">
            <img src="${
              this.currentUser.photoURL ||
              "https://img.icons8.com/fluency/96/user-male-circle.png"
            }" 
                 alt="Profile" class="user-avatar">
            <div class="font-medium">${
              this.currentUser.displayName || "User"
            }</div>
            <div class="text-sm text-gray-500">${
              this.currentUser.email || ""
            }</div>
          </div>
          <a href="#" class="dropdown-item" id="menu-settings">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item" id="menu-logout">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sign Out
          </a>
        </div>
      </div>
    `;

    // Add event listeners for user menu
    this.setupUserMenuEvents();
  }

  /**
   * Render guest user UI
   */
  renderGuestUser() {
    this.elements.headerAuth.innerHTML = `
      <div class="flex items-center">
        <div class="flex items-center px-2 py-1 rounded-l bg-gray-700 border-r border-gray-600">
          <div class="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span class="text-gray-300 text-xs sm:text-sm">Guest Mode</span>
        </div>
        <button id="header-login-btn" class="text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 text-white rounded-r">
          Sign In
        </button>
      </div>
    `;

    this.addEventListenerSafe("header-login-btn", "click", () => {
      this.showSettings();
    });
  }

  /**
   * Render anonymous user UI
   */
  renderAnonymousUser() {
    this.elements.headerAuth.innerHTML = `
      <div class="flex items-center">
        <button id="header-register-btn" class="auth-button register text-sm mr-2">
          Register
        </button>
        <button id="header-login-btn" class="auth-button login text-sm">
          Sign In
        </button>
      </div>
    `;

    this.addEventListenerSafe("header-login-btn", "click", () => {
      this.showSettings();
    });

    this.addEventListenerSafe("header-register-btn", "click", () => {
      this.showSettings();
    });
  }

  /**
   * Setup user menu event listeners
   */
  setupUserMenuEvents() {
    const userMenuTrigger = document.getElementById("user-menu-trigger");
    const userMenu = document.getElementById("user-menu");
    const menuSettings = document.getElementById("menu-settings");
    const menuLogout = document.getElementById("menu-logout");

    if (userMenuTrigger && userMenu) {
      userMenuTrigger.addEventListener("click", (e) => {
        e.preventDefault();
        userMenu.classList.toggle("active");
      });

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!userMenu.contains(e.target)) {
          userMenu.classList.remove("active");
        }
      });
    }

    if (menuSettings) {
      menuSettings.addEventListener("click", (e) => {
        e.preventDefault();
        this.showSettings();
      });
    }

    if (menuLogout) {
      menuLogout.addEventListener("click", (e) => {
        e.preventDefault();
        this.signOut();
      });
    }
  }

  /**
   * Set guest mode
   */
  setGuestMode() {
    this.currentUser = null;
    this.currentUserMode = "guest";
    storage.setUserMode("guest");
    this.updateAuthUI();
    this.showToast(
      "Continuing as guest. Data will be stored locally only.",
      "success"
    );
    this.showMainMenu();
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      if (firebase.auth && firebase.auth().currentUser) {
        await firebase.auth().signOut();
      }

      this.currentUser = null;
      this.currentUserMode = "anonymous";
      storage.setUserMode("anonymous");
      this.updateAuthUI();
      this.showToast("Signed out successfully", "success");
      this.showMainMenu();
    } catch (error) {
      console.error("Error signing out:", error);
      this.showToast("Error signing out: " + error.message, "error");
    }
  }

  /**
   * Show main menu page
   */
  showMainMenu() {
    this.hideAllPages();
    if (this.pages.mainMenu) {
      this.pages.mainMenu.classList.remove("hidden");
    }
    this.currentPage = "main-menu";
    this.updateHistory("main-menu");
  }

  /**
   * Show BRD list page
   */
  async showBRDList(mode = "preview") {
    this.hideAllPages();
    if (this.pages.brdList) {
      this.pages.brdList.classList.remove("hidden");
    }

    // Update title based on mode
    const titleElement = document.getElementById("brd-list-title");
    if (titleElement) {
      titleElement.textContent = mode === "edit" ? "Edit BRD" : "View BRD";
    }

    this.currentPage = "brd-list";
    this.updateHistory("brd-list");

    // Load BRD list
    await this.loadBRDList(mode);
  }

  /**
   * Show BRD preview page
   */
  async showBRDPreview(brdIndex) {
    this.hideAllPages();
    if (this.pages.brdPreview) {
      this.pages.brdPreview.classList.remove("hidden");
    }

    this.currentPage = "brd-preview";
    this.updateHistory("brd-preview");

    // Load BRD for preview
    await this.loadBRDPreview(brdIndex);
  }

  /**
   * Show wizard page
   */
  async showWizard(mode = "new", editIndex = null) {
    this.hideAllPages();
    if (this.pages.wizard) {
      this.pages.wizard.classList.remove("hidden");
    }

    this.currentPage = "wizard";
    this.updateHistory("wizard");

    // Generate form
    try {
      await formGenerator.generateForm(mode, editIndex);
    } catch (error) {
      console.error("Error generating form:", error);
      this.showError("Error loading form: " + error.message);
    }
  }

  /**
   * Show settings page
   */
  showSettings() {
    this.hideAllPages();
    if (this.pages.settings) {
      this.pages.settings.classList.remove("hidden");
    }

    this.currentPage = "settings";
    this.updateHistory("settings");

    // Update settings UI
    this.updateSettingsUI();
  }

  /**
   * Hide all pages
   */
  hideAllPages() {
    Object.values(this.pages).forEach((page) => {
      if (page) {
        page.classList.add("hidden");
      }
    });
  }

  /**
   * Update browser history
   */
  updateHistory(page, pushState = true) {
    if (pushState && window.history) {
      window.history.pushState({ page }, "", `#${page}`);
    }
  }

  /**
   * Navigate to specific page
   */
  navigateToPage(page, pushState = true) {
    switch (page) {
      case "main-menu":
        this.showMainMenu();
        break;
      case "brd-list":
        this.showBRDList();
        break;
      case "settings":
        this.showSettings();
        break;
      default:
        this.showMainMenu();
    }
  }

  /**
   * Load and display BRD list
   */
  async loadBRDList(mode) {
    if (!this.elements.brdListContainer) return;

    try {
      this.showLoading();
      const brds = await storage.loadBRDs();

      if (brds.length === 0) {
        this.elements.brdListContainer.innerHTML = `
          <div class="text-center py-8">
            <p class="text-gray-400">No saved BRDs found.</p>
            <button id="create-first-brd" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Create Your First BRD
            </button>
          </div>
        `;

        this.addEventListenerSafe("create-first-brd", "click", () => {
          this.showWizard("new");
        });
      } else {
        this.renderBRDList(brds, mode);
      }
    } catch (error) {
      console.error("Error loading BRD list:", error);
      this.showError("Error loading BRD list: " + error.message);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Render BRD list
   */
  renderBRDList(brds, mode) {
    this.elements.brdListContainer.innerHTML = "";

    brds.forEach((brd, index) => {
      const listItem = document.createElement("div");
      listItem.className =
        "brd-list-item p-4 border-b border-gray-700 flex justify-between items-center hover:bg-gray-800/50 transition-colors";

      const date = new Date(brd.lastUpdated || Date.now()).toLocaleDateString(
        "en-US"
      );

      listItem.innerHTML = `
        <div class="flex-1">
          <h3 class="font-semibold text-lg text-white">${
            brd.title || "Untitled BRD"
          }</h3>
          <p class="text-gray-400 text-sm">Last updated: ${date}</p>
          <p class="text-gray-500 text-xs mt-1">${
            brd["nama-perusahaan"] || "No company specified"
          }</p>
        </div>
        <div class="flex space-x-2">
          <button class="brd-action-btn bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors">
            ${mode === "edit" ? "Edit" : "View"}
          </button>
          <button class="brd-delete-btn bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors">
            Delete
          </button>
        </div>
      `;

      // Add event listeners
      const actionBtn = listItem.querySelector(".brd-action-btn");
      const deleteBtn = listItem.querySelector(".brd-delete-btn");

      actionBtn.addEventListener("click", () => {
        if (mode === "edit") {
          this.showWizard("edit", index);
        } else {
          this.showBRDPreview(index);
        }
      });

      deleteBtn.addEventListener("click", () => {
        this.deleteBRD(index, brd.title);
      });

      this.elements.brdListContainer.appendChild(listItem);
    });
  }

  /**
   * Delete BRD with confirmation
   */
  async deleteBRD(index, title) {
    if (
      confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`
      )
    ) {
      try {
        this.showLoading();
        await storage.deleteBRD(index);
        this.showToast("BRD deleted successfully", "success");

        // Reload the list
        await this.loadBRDList("preview");
      } catch (error) {
        console.error("Error deleting BRD:", error);
        this.showError("Error deleting BRD: " + error.message);
      } finally {
        this.hideLoading();
      }
    }
  }

  /**
   * Load BRD for preview
   */
  async loadBRDPreview(brdIndex) {
    try {
      this.showLoading();
      const brd = await storage.loadBRD(brdIndex);

      if (!brd) {
        throw new Error("BRD not found");
      }

      this.renderBRDPreview(brd);
    } catch (error) {
      console.error("Error loading BRD preview:", error);
      this.showError("Error loading BRD preview: " + error.message);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Render BRD preview
   */
  renderBRDPreview(brd) {
    if (!this.elements.previewContent) return;

    // Generate preview HTML
    this.elements.previewContent.innerHTML = `
      <div class="brd-preview">
        <header class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">${
            brd.title || "Business Requirement Document"
          }</h1>
          <div class="text-gray-400">
            <p>Company: ${brd["nama-perusahaan"] || "Not specified"}</p>
            <p>Version: ${brd.versi || "1.0"}</p>
            <p>Date: ${this.formatDate(
              brd.tanggal || new Date().toISOString()
            )}</p>
          </div>
        </header>
        
        ${this.renderPreviewSection("Project Overview", [
          { label: "Background", value: brd["latar-belakang"] },
          { label: "Objectives", value: brd["tujuan"] },
          { label: "Scope", value: brd["ruang-lingkup"] },
          { label: "Benefits", value: brd["manfaat"] },
        ])}
        
        ${this.renderPreviewSection("Stakeholders", [
          { label: "Project Sponsor", value: brd["project-sponsor"] },
          { label: "Project Manager", value: brd["project-manager"] },
          { label: "Business Analyst", value: brd["business-analyst"] },
          { label: "Other Stakeholders", value: brd["stakeholder-lain"] },
        ])}
        
        ${this.renderPreviewSection("Requirements", [
          { label: "Main Requirements", value: brd["kebutuhan-utama"] },
          {
            label: "Additional Requirements",
            value: brd["kebutuhan-tambahan"],
          },
          { label: "Business Processes", value: brd["proses-bisnis"] },
        ])}
        
        ${this.renderPreviewSection("Non-Functional Requirements", [
          { label: "Performance", value: brd["performa"] },
          { label: "Security", value: brd["keamanan"] },
          { label: "Scalability", value: brd["skalabilitas"] },
          { label: "Compatibility", value: brd["kompatibilitas"] },
        ])}
        
        ${this.renderPreviewSection("Timeline", [
          { label: "Start Date", value: brd["tanggal-mulai"] },
          { label: "End Date", value: brd["tanggal-selesai"] },
          { label: "Milestones", value: brd["milestone"] },
          { label: "Deliverables", value: brd["deliverables"] },
        ])}
      </div>
    `;
  }

  /**
   * Render preview section
   */
  renderPreviewSection(title, fields) {
    const validFields = fields.filter(
      (field) => field.value && field.value.trim()
    );

    if (validFields.length === 0) {
      return "";
    }

    return `
      <section class="mb-8">
        <h2 class="text-xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">${title}</h2>
        ${validFields
          .map(
            (field) => `
          <div class="mb-4">
            <h3 class="font-medium text-gray-300 mb-2">${field.label}</h3>
            <div class="text-gray-400 whitespace-pre-wrap">${field.value}</div>
          </div>
        `
          )
          .join("")}
      </section>
    `;
  }

  /**
   * Download current PDF
   */
  async downloadCurrentPDF() {
    try {
      this.showLoading();
      await pdfGenerator.generatePDFFromPreview();
    } catch (error) {
      console.error("Error downloading PDF:", error);
      this.showError("Error downloading PDF: " + error.message);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Update settings UI
   */
  updateSettingsUI() {
    const notLoggedInDiv = document.getElementById("account-not-logged-in");
    const loggedInDiv = document.getElementById("account-logged-in");
    const guestModeDiv = document.getElementById("account-guest-mode");

    // Hide all sections first
    [notLoggedInDiv, loggedInDiv, guestModeDiv].forEach((div) => {
      if (div) div.classList.add("hidden");
    });

    if (this.currentUser && loggedInDiv) {
      loggedInDiv.classList.remove("hidden");
      this.updateLoggedInUserInfo();
    } else if (this.currentUserMode === "guest" && guestModeDiv) {
      guestModeDiv.classList.remove("hidden");
    } else if (notLoggedInDiv) {
      notLoggedInDiv.classList.remove("hidden");
    }
  }

  /**
   * Update logged in user info in settings
   */
  updateLoggedInUserInfo() {
    const displayNameEl = document.getElementById("user-display-name");
    const emailEl = document.getElementById("user-email");
    const avatarEl = document.getElementById("user-avatar");

    if (displayNameEl)
      displayNameEl.textContent = this.currentUser.displayName || "User";
    if (emailEl) emailEl.textContent = this.currentUser.email || "";
    if (avatarEl)
      avatarEl.src =
        this.currentUser.photoURL ||
        "https://img.icons8.com/fluency/96/user-male-circle.png";
  }

  /**
   * Migrate local data to cloud
   */
  async migrateLocalData() {
    try {
      const migratedCount = await storage.migrateLocalToCloud();
      if (migratedCount > 0) {
        this.showToast(
          `${migratedCount} BRDs migrated to cloud storage`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error migrating local data:", error);
    }
  }

  /**
   * Handle window resize
   */
  handleWindowResize() {
    // Adjust UI for different screen sizes
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle("mobile-view", isMobile);
  }

  /**
   * Handle app focus (when user returns to tab)
   */
  async onAppFocus() {
    // Refresh data if needed
    if (this.currentPage === "brd-list") {
      await this.loadBRDList("preview");
    }
  }

  /**
   * Show loading overlay
   */
  showLoading() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.classList.remove("hidden");
    }
  }

  /**
   * Hide loading overlay
   */
  hideLoading() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.classList.add("hidden");
    }
  }

  /**
   * Show toast notification
   */
  showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type} px-4 py-2 rounded shadow-lg text-white transition-all duration-300 transform translate-x-full`;

    // Set background color based on type
    switch (type) {
      case "success":
        toast.style.backgroundColor = "#10b981";
        break;
      case "error":
        toast.style.backgroundColor = "#ef4444";
        break;
      case "info":
        toast.style.backgroundColor = "#3b82f6";
        break;
      default:
        toast.style.backgroundColor = "#6b7280";
    }

    toast.textContent = message;

    this.elements.toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove("translate-x-full");
    }, 100);

    // Animate out and remove
    setTimeout(() => {
      toast.classList.add("translate-x-full");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 4000);
  }

  /**
   * Show error message
   */
  showError(message) {
    console.error("BRD Generator Error:", message);
    this.showToast(message, "error");
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Debounce utility function
   */
  debounce(func, wait) {
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
   * Cleanup method for removing event listeners
   */
  cleanup() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners.clear();
  }
}

// Initialize the application
const brdApp = new BRDApp();

// Make available globally for compatibility
window.brdApp = brdApp;
window.showMainMenu = () => brdApp.showMainMenu();
window.showBRDList = (mode) => brdApp.showBRDList(mode);
window.showBRDPreview = (index) => brdApp.showBRDPreview(index);
window.showWizard = (mode, editIndex) => brdApp.showWizard(mode, editIndex);
window.showSettings = () => brdApp.showSettings();
window.showToast = (message, type) => brdApp.showToast(message, type);
window.showError = (message) => brdApp.showError(message);

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = BRDApp;
}
