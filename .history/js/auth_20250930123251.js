/**
 * Data storage and management functions
 */

/**
 * Save current draft data
 * @param {Object} data - Form data
 * @param {number} step - Current step
 */
function saveCurrentDraft(data, step = 0) {
  try {
    const draft = {
      data: data,
      step: step,
      timestamp: Date.now(),
    };
    localStorage.setItem("brd_draft", JSON.stringify(draft));
    console.log("Draft saved");
  } catch (error) {
    showError(error);
  }
}

/**
 * Get current draft data
 * @returns {Object|null} Draft data or null
 */
function getCurrentDraft() {
  try {
    const draft = localStorage.getItem("brd_draft");
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error("Error loading draft:", error);
    return null;
  }
}

/**
 * Clear current draft
 */
function clearDraft() {
  try {
    localStorage.removeItem("brd_draft");
    console.log("Draft cleared");
  } catch (error) {
    showError(error);
  }
}

/**
 * Save BRD data to localStorage
 * @param {Object} data - BRD form data
 * @param {string} brdId - Optional BRD ID for editing
 * @returns {string|null} Saved BRD ID or null if failed
 */
function saveBRD(data, brdId = null) {
  try {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const id = brdId || `brd_${timestamp}_${randomId}`;

    const brdData = {
      id: id,
      data: data,
      createdAt: brdId ? (loadBRD(brdId)?.createdAt || timestamp) : timestamp,
      updatedAt: timestamp,
    };

    localStorage.setItem(`brd_${id}`, JSON.stringify(brdData));
    updateBRDList(brdData);

    console.log(`BRD saved with ID: ${id}`);
    return id;
  } catch (error) {
    showError(error);
    return null;
  }
}

/**
 * Load BRD data from localStorage
 * @param {string} id - BRD ID
 * @returns {Object|null} BRD data or null
 */
function loadBRD(id) {
  try {
    const brdData = localStorage.getItem(`brd_${id}`);
    const result = brdData ? JSON.parse(brdData) : null;
    if (result) {
      console.log(`BRD loaded with ID: ${id}`);
    }
    return result;
  } catch (error) {
    showError(error);
    return null;
  }
}

/**
 * Delete BRD from storage
 * @param {string} id - BRD ID to delete
 */
function deleteBRD(id) {
  try {
    const brdData = loadBRD(id);
    if (!brdData) {
      showToast("BRD tidak ditemukan", "error");
      return;
    }

    const title = brdData.data["input-nama-proyek"] || "BRD Tanpa Judul";

    if (confirm(`Apakah Anda yakin ingin menghapus "${title}"?\n\nTindakan ini tidak dapat dibatalkan.`)) {
      localStorage.removeItem(`brd_${id}`);

      let brdList = JSON.parse(localStorage.getItem("brd_list") || "[]");
      brdList = brdList.filter((item) => item.id !== id);
      localStorage.setItem("brd_list", JSON.stringify(brdList));

      showToast("BRD berhasil dihapus", "success");
      return true;
    }
    return false;
  } catch (error) {
    showError(error);
    return false;
  }
}

/**
 * Update BRD list in localStorage
 * @param {Object} brdData - BRD data object
 */
function updateBRDList(brdData) {
  let brdList = JSON.parse(localStorage.getItem("brd_list") || "[]");

  const title = brdData.data["input-nama-proyek"] || "BRD Tanpa Judul";
  const existingIndex = brdList.findIndex((item) => item.id === brdData.id);

  const listItem = {
    id: brdData.id,
    title: title,
    createdAt: brdData.createdAt,
    updatedAt: brdData.updatedAt,
    userId: brdData.userId || null,
  };

  if (existingIndex >= 0) {
    brdList[existingIndex] = listItem;
  } else {
    brdList.unshift(listItem);
  }

  localStorage.setItem("brd_list", JSON.stringify(brdList));
}

/**
 * Save BRD to cloud (Firestore)
 * @param {Object} data - BRD form data
 * @param {string} brdId - Optional BRD ID for editing
 * @returns {Promise<string>} Promise resolving to BRD ID
 */
function saveBRDToCloud(data, brdId = null) {
  if (!firebaseInitialized || !currentUser) {
    return Promise.resolve(saveBRD(data, brdId));
  }

  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const id = brdId || `brd_${timestamp}_${randomId}`;

    const brdData = {
      id: id,
      data: data,
      createdAt: brdId ? (loadBRDFromCloud(brdId)?.createdAt || timestamp) : timestamp,
      updatedAt: timestamp,
      userId: currentUser.uid,
    };

    const db = firebase.firestore();

    db.collection("users")
      .doc(currentUser.uid)
      .collection("brds")
      .doc(id)
      .set(brdData)
      .then(() => {
        localStorage.setItem(`brd_${id}`, JSON.stringify(brdData));
        updateBRDList(brdData);
        resolve(id);
      })
      .catch((error) => {
        console.error("Error saving BRD to cloud:", error);
        const localId = saveBRD(data, brdId);
        if (localId) {
          resolve(localId);
        } else// filepath: js/storage.js
/**
 * Data storage and management functions
 */

/**
 * Save current draft data
 * @param {Object} data - Form data
 * @param {number} step - Current step
 */
function saveCurrentDraft(data, step = 0) {
  try {
    const draft = {
      data: data,
      step: step,
      timestamp: Date.now(),
    };
    localStorage.setItem("brd_draft", JSON.stringify(draft));
    console.log("Draft saved");
  } catch (error) {
    showError(error);
  }
}

/**
 * Get current draft data
 * @returns {Object|null} Draft data or null
 */
function getCurrentDraft() {
  try {
    const draft = localStorage.getItem("brd_draft");
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error("Error loading draft:", error);
    return null;
  }
}

/**
 * Clear current draft
 */
function clearDraft() {
  try {
    localStorage.removeItem("brd_draft");
    console.log("Draft cleared");
  } catch (error) {
    showError(error);
  }
}

/**
 * Save BRD data to localStorage
 * @param {Object} data - BRD form data
 * @param {string} brdId - Optional BRD ID for editing
 * @returns {string|null} Saved BRD ID or null if failed
 */
function saveBRD(data, brdId = null) {
  try {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const id = brdId || `brd_${timestamp}_${randomId}`;

    const brdData = {
      id: id,
      data: data,
      createdAt: brdId ? (loadBRD(brdId)?.createdAt || timestamp) : timestamp,
      updatedAt: timestamp,
    };

    localStorage.setItem(`brd_${id}`, JSON.stringify(brdData));
    updateBRDList(brdData);

    console.log(`BRD saved with ID: ${id}`);
    return id;
  } catch (error) {
    showError(error);
    return null;
  }
}

/**
 * Load BRD data from localStorage
 * @param {string} id - BRD ID
 * @returns {Object|null} BRD data or null
 */
function loadBRD(id) {
  try {
    const brdData = localStorage.getItem(`brd_${id}`);
    const result = brdData ? JSON.parse(brdData) : null;
    if (result) {
      console.log(`BRD loaded with ID: ${id}`);
    }
    return result;
  } catch (error) {
    showError(error);
    return null;
  }
}

/**
 * Delete BRD from storage
 * @param {string} id - BRD ID to delete
 */
function deleteBRD(id) {
  try {
    const brdData = loadBRD(id);
    if (!brdData) {
      showToast("BRD tidak ditemukan", "error");
      return;
    }

    const title = brdData.data["input-nama-proyek"] || "BRD Tanpa Judul";

    if (confirm(`Apakah Anda yakin ingin menghapus "${title}"?\n\nTindakan ini tidak dapat dibatalkan.`)) {
      localStorage.removeItem(`brd_${id}`);

      let brdList = JSON.parse(localStorage.getItem("brd_list") || "[]");
      brdList = brdList.filter((item) => item.id !== id);
      localStorage.setItem("brd_list", JSON.stringify(brdList));

      showToast("BRD berhasil dihapus", "success");
      return true;
    }
    return false;
  } catch (error) {
    showError(error);
    return false;
  }
}

/**
 * Update BRD list in localStorage
 * @param {Object} brdData - BRD data object
 */
function updateBRDList(brdData) {
  let brdList = JSON.parse(localStorage.getItem("brd_list") || "[]");

  const title = brdData.data["input-nama-proyek"] || "BRD Tanpa Judul";
  const existingIndex = brdList.findIndex((item) => item.id === brdData.id);

  const listItem = {
    id: brdData.id,
    title: title,
    createdAt: brdData.createdAt,
    updatedAt: brdData.updatedAt,
    userId: brdData.userId || null,
  };

  if (existingIndex >= 0) {
    brdList[existingIndex] = listItem;
  } else {
    brdList.unshift(listItem);
  }

  localStorage.setItem("brd_list", JSON.stringify(brdList));
}

/**
 * Save BRD to cloud (Firestore)
 * @param {Object} data - BRD form data
 * @param {string} brdId - Optional BRD ID for editing
 * @returns {Promise<string>} Promise resolving to BRD ID
 */
function saveBRDToCloud(data, brdId = null) {
  if (!firebaseInitialized || !currentUser) {
    return Promise.resolve(saveBRD(data, brdId));
  }

  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const id = brdId || `brd_${timestamp}_${randomId}`;

    const brdData = {
      id: id,
      data: data,
      createdAt: brdId ? (loadBRDFromCloud(brdId)?.createdAt || timestamp) : timestamp,
      updatedAt: timestamp,
      userId: currentUser.uid,
    };

    const db = firebase.firestore();

    db.collection("users")
      .doc(currentUser.uid)
      .collection("brds")
      .doc(id)
      .set(brdData)
      .then(() => {
        localStorage.setItem(`brd_${id}`, JSON.stringify(brdData));
        updateBRDList(brdData);
        resolve(id);
      })
      .catch((error) => {
        console.error("Error saving BRD to cloud:", error);
        const localId = saveBRD(data, brdId);
        if (localId) {
          resolve(localId);
        } else