/**
 * Storage Manager for BRD Generator
 * Handles localStorage and Firebase Firestore operations
 */

class StorageManager {
  constructor() {
    this.localStorageKey = "brd_drafts";
    this.tempDataKey = "brd_temp_data";
    this.userModeKey = "userMode";
    this.themeKey = "theme";
    this.firestore = null;

    // Initialize Firestore if available
    this.initializeFirestore();
  }

  /**
   * Initialize Firestore connection
   */
  initializeFirestore() {
    try {
      if (typeof firebase !== "undefined" && firebase.firestore) {
        this.firestore = firebase.firestore();
        console.log("Firestore initialized successfully");
      }
    } catch (error) {
      console.warn("Firestore initialization failed:", error);
      this.firestore = null;
    }
  }

  /**
   * Check if user is authenticated and can use cloud storage
   * @returns {boolean}
   */
  canUseCloudStorage() {
    return this.firestore && firebase.auth().currentUser;
  }

  /**
   * Save BRD data
   * @param {Object} brdData - BRD data object
   * @param {string} mode - 'new' or 'edit'
   * @param {number} [editIndex] - Index for editing existing BRD
   * @returns {Promise<string>} - Returns BRD ID
   */
  async saveBRD(brdData, mode = "new", editIndex = null) {
    try {
      // Add metadata
      const currentTime = new Date().toISOString();
      const brdWithMeta = {
        ...brdData,
        id: brdData.id || this.generateUniqueId(),
        lastUpdated: currentTime,
        createdAt: brdData.createdAt || currentTime,
        title: brdData.title || "BRD Tanpa Judul",
      };

      if (this.canUseCloudStorage()) {
        // Save to Firestore
        await this.saveBRDToFirestore(brdWithMeta, mode);
      }

      // Always save to localStorage as backup
      await this.saveBRDToLocalStorage(brdWithMeta, mode, editIndex);

      return brdWithMeta.id;
    } catch (error) {
      console.error("Error saving BRD:", error);
      throw new Error("Gagal menyimpan BRD: " + error.message);
    }
  }

  /**
   * Save BRD to Firestore
   * @param {Object} brdData - BRD data with metadata
   * @param {string} mode - 'new' or 'edit'
   */
  async saveBRDToFirestore(brdData, mode) {
    if (!this.canUseCloudStorage()) {
      throw new Error("Cloud storage not available");
    }

    const user = firebase.auth().currentUser;
    const docRef = this.firestore
      .collection("users")
      .doc(user.uid)
      .collection("brds")
      .doc(brdData.id);

    await docRef.set(brdData, { merge: mode === "edit" });
    console.log("BRD saved to Firestore:", brdData.id);
  }

  /**
   * Save BRD to localStorage
   * @param {Object} brdData - BRD data with metadata
   * @param {string} mode - 'new' or 'edit'
   * @param {number} [editIndex] - Index for editing
   */
  async saveBRDToLocalStorage(brdData, mode, editIndex = null) {
    let drafts = this.getLocalBRDs();

    if (mode === "edit" && editIndex !== null && drafts[editIndex]) {
      // Update existing BRD
      drafts[editIndex] = brdData;
    } else {
      // Check if BRD with same ID already exists
      const existingIndex = drafts.findIndex((d) => d.id === brdData.id);
      if (existingIndex >= 0) {
        drafts[existingIndex] = brdData;
      } else {
        drafts.push(brdData);
      }
    }

    localStorage.setItem(this.localStorageKey, JSON.stringify(drafts));
    console.log("BRD saved to localStorage:", brdData.id);
  }

  /**
   * Load all BRDs for current user
   * @returns {Promise<Array>} Array of BRD objects
   */
  async loadBRDs() {
    try {
      let brds = [];

      if (this.canUseCloudStorage()) {
        // Load from Firestore
        brds = await this.loadBRDsFromFirestore();

        // Sync with localStorage
        this.syncBRDsToLocalStorage(brds);
      } else {
        // Load from localStorage only
        brds = this.getLocalBRDs();
      }

      // Sort by lastUpdated (newest first)
      return brds.sort(
        (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
      );
    } catch (error) {
      console.error("Error loading BRDs:", error);
      // Fallback to localStorage
      return this.getLocalBRDs();
    }
  }

  /**
   * Load BRDs from Firestore
   * @returns {Promise<Array>}
   */
  async loadBRDsFromFirestore() {
    if (!this.canUseCloudStorage()) {
      return [];
    }

    const user = firebase.auth().currentUser;
    const snapshot = await this.firestore
      .collection("users")
      .doc(user.uid)
      .collection("brds")
      .orderBy("lastUpdated", "desc")
      .get();

    const brds = [];
    snapshot.forEach((doc) => {
      brds.push({ id: doc.id, ...doc.data() });
    });

    console.log("Loaded BRDs from Firestore:", brds.length);
    return brds;
  }

  /**
   * Get BRDs from localStorage
   * @returns {Array}
   */
  getLocalBRDs() {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error parsing localStorage BRDs:", error);
      return [];
    }
  }

  /**
   * Sync BRDs to localStorage
   * @param {Array} brds - Array of BRD objects
   */
  syncBRDsToLocalStorage(brds) {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(brds));
      console.log("BRDs synced to localStorage");
    } catch (error) {
      console.error("Error syncing to localStorage:", error);
    }
  }

  /**
   * Load specific BRD by ID or index
   * @param {string|number} identifier - BRD ID or index
   * @returns {Promise<Object|null>}
   */
  async loadBRD(identifier) {
    try {
      const brds = await this.loadBRDs();

      if (typeof identifier === "number") {
        // Load by index
        return brds[identifier] || null;
      } else {
        // Load by ID
        return brds.find((brd) => brd.id === identifier) || null;
      }
    } catch (error) {
      console.error("Error loading BRD:", error);
      return null;
    }
  }

  /**
   * Delete BRD
   * @param {string|number} identifier - BRD ID or index
   * @returns {Promise<boolean>}
   */
  async deleteBRD(identifier) {
    try {
      const brds = await this.loadBRDs();
      let brdToDelete = null;
      let indexToDelete = -1;

      if (typeof identifier === "number") {
        // Delete by index
        indexToDelete = identifier;
        brdToDelete = brds[indexToDelete];
      } else {
        // Delete by ID
        indexToDelete = brds.findIndex((brd) => brd.id === identifier);
        brdToDelete = brds[indexToDelete];
      }

      if (!brdToDelete || indexToDelete < 0) {
        throw new Error("BRD tidak ditemukan");
      }

      // Delete from Firestore if available
      if (this.canUseCloudStorage()) {
        await this.deleteBRDFromFirestore(brdToDelete.id);
      }

      // Delete from localStorage
      const localBRDs = this.getLocalBRDs();
      const localIndex = localBRDs.findIndex(
        (brd) => brd.id === brdToDelete.id
      );
      if (localIndex >= 0) {
        localBRDs.splice(localIndex, 1);
        localStorage.setItem(this.localStorageKey, JSON.stringify(localBRDs));
      }

      console.log("BRD deleted:", brdToDelete.id);
      return true;
    } catch (error) {
      console.error("Error deleting BRD:", error);
      throw new Error("Gagal menghapus BRD: " + error.message);
    }
  }

  /**
   * Delete BRD from Firestore
   * @param {string} brdId - BRD ID
   */
  async deleteBRDFromFirestore(brdId) {
    if (!this.canUseCloudStorage()) {
      return;
    }

    const user = firebase.auth().currentUser;
    await this.firestore
      .collection("users")
      .doc(user.uid)
      .collection("brds")
      .doc(brdId)
      .delete();

    console.log("BRD deleted from Firestore:", brdId);
  }

  /**
   * Save temporary form data
   * @param {Object} data - Form data object
   */
  saveTempData(data) {
    try {
      const existing = this.getTempData();
      const merged = { ...existing, ...data };
      localStorage.setItem(this.tempDataKey, JSON.stringify(merged));
    } catch (error) {
      console.error("Error saving temp data:", error);
    }
  }

  /**
   * Get temporary form data
   * @returns {Object}
   */
  getTempData() {
    try {
      const stored = localStorage.getItem(this.tempDataKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error getting temp data:", error);
      return {};
    }
  }

  /**
   * Clear temporary form data
   */
  clearTempData() {
    try {
      localStorage.removeItem(this.tempDataKey);
      console.log("Temporary data cleared");
    } catch (error) {
      console.error("Error clearing temp data:", error);
    }
  }

  /**
   * Load temp data into BRD data for editing
   * @param {Object} brdData - Existing BRD data
   */
  loadTempDataForEditing(brdData) {
    try {
      // Set BRD data as temp data for form to use
      localStorage.setItem(this.tempDataKey, JSON.stringify(brdData));
      console.log("BRD data loaded for editing");
    } catch (error) {
      console.error("Error loading data for editing:", error);
    }
  }

  /**
   * Save user preferences
   * @param {string} key - Preference key
   * @param {any} value - Preference value
   */
  savePreference(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving preference:", error);
    }
  }

  /**
   * Get user preference
   * @param {string} key - Preference key
   * @param {any} defaultValue - Default value if not found
   * @returns {any}
   */
  getPreference(key, defaultValue = null) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error("Error getting preference:", error);
      return defaultValue;
    }
  }

  /**
   * Save theme preference
   * @param {string} theme - Theme name
   */
  saveTheme(theme) {
    this.savePreference(this.themeKey, theme);
  }

  /**
   * Get saved theme
   * @returns {string}
   */
  getSavedTheme() {
    return this.getPreference(this.themeKey, "default");
  }

  /**
   * Set user mode (guest, authenticated, anonymous)
   * @param {string} mode - User mode
   */
  setUserMode(mode) {
    if (mode === "anonymous") {
      localStorage.removeItem(this.userModeKey);
    } else {
      localStorage.setItem(this.userModeKey, mode);
    }
  }

  /**
   * Get current user mode
   * @returns {string}
   */
  getUserMode() {
    return localStorage.getItem(this.userModeKey) || "anonymous";
  }

  /**
   * Generate unique ID
   * @returns {string}
   */
  generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Export all BRDs as JSON
   * @returns {Promise<string>} JSON string of all BRDs
   */
  async exportBRDs() {
    try {
      const brds = await this.loadBRDs();
      const exportData = {
        exported_at: new Date().toISOString(),
        version: "1.0",
        brds: brds,
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Error exporting BRDs:", error);
      throw new Error("Gagal mengekspor BRD");
    }
  }

  /**
   * Import BRDs from JSON
   * @param {string} jsonString - JSON string containing BRDs
   * @returns {Promise<number>} Number of imported BRDs
   */
  async importBRDs(jsonString) {
    try {
      const importData = JSON.parse(jsonString);

      if (!importData.brds || !Array.isArray(importData.brds)) {
        throw new Error("Format file tidak valid");
      }

      let importedCount = 0;

      for (const brdData of importData.brds) {
        try {
          // Generate new ID to avoid conflicts
          const newBrdData = {
            ...brdData,
            id: this.generateUniqueId(),
            importedAt: new Date().toISOString(),
          };

          await this.saveBRD(newBrdData, "new");
          importedCount++;
        } catch (error) {
          console.error("Error importing individual BRD:", error);
        }
      }

      console.log(`Imported ${importedCount} BRDs`);
      return importedCount;
    } catch (error) {
      console.error("Error importing BRDs:", error);
      throw new Error("Gagal mengimpor BRD: " + error.message);
    }
  }

  /**
   * Migrate local data to cloud when user signs in
   * @returns {Promise<number>} Number of migrated BRDs
   */
  async migrateLocalToCloud() {
    if (!this.canUseCloudStorage()) {
      return 0;
    }

    try {
      const localBRDs = this.getLocalBRDs();
      const cloudBRDs = await this.loadBRDsFromFirestore();

      let migratedCount = 0;

      for (const localBRD of localBRDs) {
        // Check if BRD already exists in cloud
        const existsInCloud = cloudBRDs.some(
          (cloudBRD) =>
            cloudBRD.title === localBRD.title &&
            cloudBRD.createdAt === localBRD.createdAt
        );

        if (!existsInCloud) {
          await this.saveBRDToFirestore(localBRD, "new");
          migratedCount++;
        }
      }

      console.log(`Migrated ${migratedCount} BRDs to cloud`);
      return migratedCount;
    } catch (error) {
      console.error("Error migrating to cloud:", error);
      return 0;
    }
  }

  /**
   * Clear all local storage data
   */
  clearAllLocalData() {
    try {
      localStorage.removeItem(this.localStorageKey);
      localStorage.removeItem(this.tempDataKey);
      console.log("All local data cleared");
    } catch (error) {
      console.error("Error clearing local data:", error);
    }
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>} Storage stats object
   */
  async getStorageStats() {
    try {
      const localBRDs = this.getLocalBRDs();
      let cloudBRDs = [];

      if (this.canUseCloudStorage()) {
        cloudBRDs = await this.loadBRDsFromFirestore();
      }

      return {
        local: {
          count: localBRDs.length,
          totalSize: JSON.stringify(localBRDs).length,
        },
        cloud: {
          count: cloudBRDs.length,
          available: this.canUseCloudStorage(),
        },
        userMode: this.getUserMode(),
        lastSync: this.getPreference("lastSync", null),
      };
    } catch (error) {
      console.error("Error getting storage stats:", error);
      return {
        local: { count: 0, totalSize: 0 },
        cloud: { count: 0, available: false },
        userMode: "anonymous",
        lastSync: null,
      };
    }
  }
}

// Create and export storage manager instance
const storage = new StorageManager();

// Make available globally for compatibility
window.storage = storage;
