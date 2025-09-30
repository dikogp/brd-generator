/**
 * Authentication management functions
 */

let currentUser = null;
let firebaseInitialized = false;

/**
 * Initialize authentication system
 */
function initializeAuth() {
  try {
    // Check if Firebase is initialized
    if (isFirebaseAvailable()) {
      try {
        firebase.app();
        firebaseInitialized = true;
        console.log("Using Firebase from external configuration");

        if (firebase.auth) {
          firebase.auth().onAuthStateChanged((user) => {
            currentUser = user;
            if (user) {
              updateUIforLoggedInUser(user);
            } else {
              updateUIforLoggedOutUser();
            }
            updateHeaderAuth();
          });
        }
      } catch (error) {
        console.error("Error verifying Firebase:", error);
        firebaseInitialized = false;
      }
    }

    if (!firebaseInitialized) {
      console.warn("Firebase not initialized - running in offline mode");
      setupOfflineMode();
    }

    setupAuthEventListeners();
  } catch (error) {
    console.error("Error in initializeAuth:", error);
    setupOfflineMode();
  }
}

/**
 * Setup offline mode (guest only)
 */
function setupOfflineMode() {
  const googleLoginButtons = document.querySelectorAll(
    "#btn-google-login, #btn-switch-to-account"
  );
  googleLoginButtons.forEach((btn) => {
    if (btn) {
      btn.style.display = "none";
    }
  });

  // Show offline message
  const offlineMsg = document.createElement("p");
  offlineMsg.className = "text-amber-400 text-sm mb-3";
  offlineMsg.textContent = "Google login tidak tersedia (mode offline)";

  const loginContainer = document.getElementById("account-not-logged-in");
  if (loginContainer) {
    loginContainer.insertBefore(
      offlineMsg,
      document.getElementById("btn-google-login")
    );
  }
}

/**
 * Setup authentication event listeners
 */
function setupAuthEventListeners() {
  // Guest login
  const guestLoginBtns = document.querySelectorAll("#btn-guest-login");
  guestLoginBtns.forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", signInAsGuest);
    }
  });

  // Google login (only if Firebase is available)
  if (firebaseInitialized) {
    const googleLoginBtns = document.querySelectorAll(
      "#btn-google-login, #btn-switch-to-account"
    );
    googleLoginBtns.forEach((btn) => {
      if (btn) {
        btn.addEventListener("click", signInWithGoogle);
      }
    });

    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", signOut);
    }
  }
}

/**
 * Sign in with Google
 */
function signInWithGoogle() {
  if (!firebaseInitialized || !firebase.auth) {
    showToast(
      "Firebase tidak dikonfigurasi - login Google tidak tersedia",
      "error"
    );
    return;
  }

  const provider = new firebase.auth.GoogleAuthProvider();

  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      showToast("Login berhasil!", "success");
      currentUser = result.user;
      migrateLocalDataToCloud(currentUser.uid);
    })
    .catch((error) => {
      console.error("Auth Error:", error);

      if (error.code === "auth/configuration-not-found") {
        showToast(
          "Konfigurasi Firebase perlu diatur. Administrator perlu mengaktifkan Google Sign-in di Firebase Console.",
          "error",
          6000
        );
      } else if (error.code === "auth/unauthorized-domain") {
        showToast(
          "Domain tidak diizinkan untuk autentikasi. Tambahkan domain ini di Firebase Console.",
          "error",
          6000
        );
      } else {
        showToast("Login gagal: " + error.message, "error");
      }

      setTimeout(() => {
        signInAsGuest();
      }, 2000);
    });
}

/**
 * Sign in as guest
 */
function signInAsGuest() {
  localStorage.setItem("userMode", "guest");
  updateUIforLoggedOutUser();
  updateHeaderAuth();
  showToast("Mode tamu diaktifkan. Data akan tersimpan lokal saja.", "success");
}

/**
 * Sign out
 */
function signOut() {
  if (firebaseInitialized && firebase.auth) {
    firebase
      .auth()
      .signOut()
      .then(() => {
        currentUser = null;
        showToast("Logout berhasil", "success");
        updateUIforLoggedOutUser();
        updateHeaderAuth();
      })
      .catch((error) => {
        showToast("Logout gagal: " + error.message, "error");
      });
  } else {
    // Guest mode logout
    localStorage.removeItem("userMode");
    currentUser = null;
    updateUIforLoggedOutUser();
    updateHeaderAuth();
    showToast("Berhasil keluar dari mode tamu", "success");
  }
}

/**
 * Update UI for logged in user
 * @param {Object} user - Firebase user object
 */
function updateUIforLoggedInUser(user) {
  const elements = {
    avatar: document.getElementById("user-avatar"),
    displayName: document.getElementById("user-display-name"),
    email: document.getElementById("user-email"),
  };

  if (elements.avatar) elements.avatar.src = user.photoURL || "";
  if (elements.displayName)
    elements.displayName.textContent = user.displayName || "User";
  if (elements.email) elements.email.textContent = user.email || "";

  // Show/hide appropriate sections
  const sections = {
    notLoggedIn: document.getElementById("account-not-logged-in"),
    loggedIn: document.getElementById("account-logged-in"),
    guestMode: document.getElementById("account-guest-mode"),
  };

  if (sections.notLoggedIn) sections.notLoggedIn.classList.add("hidden");
  if (sections.loggedIn) sections.loggedIn.classList.remove("hidden");
  if (sections.guestMode) sections.guestMode.classList.add("hidden");

  localStorage.setItem("userMode", "account");
}

/**
 * Update UI for logged out user
 */
function updateUIforLoggedOutUser() {
  const userMode = localStorage.getItem("userMode");

  const sections = {
    notLoggedIn: document.getElementById("account-not-logged-in"),
    loggedIn: document.getElementById("account-logged-in"),
    guestMode: document.getElementById("account-guest-mode"),
  };

  if (userMode === "guest") {
    if (sections.notLoggedIn) sections.notLoggedIn.classList.add("hidden");
    if (sections.loggedIn) sections.loggedIn.classList.add("hidden");
    if (sections.guestMode) sections.guestMode.classList.remove("hidden");
  } else {
    if (sections.notLoggedIn) sections.notLoggedIn.classList.remove("hidden");
    if (sections.loggedIn) sections.loggedIn.classList.add("hidden");
    if (sections.guestMode) sections.guestMode.classList.add("hidden");
    localStorage.removeItem("userMode");
  }
}

/**
 * Update header authentication display
 */
function updateHeaderAuth() {
  const authContainer = document.getElementById("header-auth-container");
  if (!authContainer) return;

  if (currentUser) {
    // User is logged in
    authContainer.innerHTML = `
      <div class="user-menu" id="user-menu">
        <div class="flex items-center cursor-pointer px-3 py-1 rounded hover:bg-gray-700" id="user-menu-trigger">
          <img src="${
            currentUser.photoURL ||
            "https://img.icons8.com/fluency/96/user-male-circle.png"
          }" 
               alt="Profile" class="w-8 h-8 rounded-full mr-2 border border-blue-400">
          <span class="mr-1 text-sm hidden sm:inline">${
            currentUser.displayName || currentUser.email || "User"
          }</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="user-menu-dropdown">
          <div class="user-info-container">
            <img src="${
              currentUser.photoURL ||
              "https://img.icons8.com/fluency/96/user-male-circle.png"
            }" 
                 alt="Profile" class="user-avatar">
            <div class="font-medium">${currentUser.displayName || "User"}</div>
            <div class="text-sm text-gray-500">${currentUser.email || ""}</div>
          </div>
          <a href="#" class="dropdown-item" id="menu-settings">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Pengaturan
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item" id="menu-logout">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Keluar
          </a>
        </div>
      </div>
    `;

    setupUserMenuEvents();
  } else if (localStorage.getItem("userMode") === "guest") {
    // Guest mode
    authContainer.innerHTML = `
      <div class="flex items-center">
        <div class="flex items-center px-2 py-1 rounded-l bg-gray-700 border-r border-gray-600">
          <div class="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span class="text-gray-300 text-xs sm:text-sm">Mode Tamu</span>
        </div>
        <button id="header-login-btn" class="text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 text-white rounded">
          Masuk
        </button>
      </div>
    `;

    const headerLoginBtn = document.getElementById("header-login-btn");
    if (headerLoginBtn) {
      headerLoginBtn.addEventListener("click", showSettings);
    }
  } else {
    // Not logged in
    authContainer.innerHTML = `
      <div class="flex items-center">
        <button id="header-register-btn" class="auth-button register text-sm mr-2">
          Daftar
        </button>
        <button id="header-login-btn" class="auth-button login text-sm">
          Masuk
        </button>
      </div>
    `;

    const headerLoginBtn = document.getElementById("header-login-btn");
    const headerRegisterBtn = document.getElementById("header-register-btn");

    if (headerLoginBtn) {
      headerLoginBtn.addEventListener("click", showSettings);
    }
    if (headerRegisterBtn) {
      headerRegisterBtn.addEventListener("click", showSettings);
    }
  }
}

/**
 * Setup user menu dropdown events
 */
function setupUserMenuEvents() {
  const userMenuTrigger = document.getElementById("user-menu-trigger");
  const menuSettings = document.getElementById("menu-settings");
  const menuLogout = document.getElementById("menu-logout");

  if (userMenuTrigger) {
    userMenuTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      const userMenu = document.getElementById("user-menu");
      if (userMenu) {
        userMenu.classList.toggle("active");
      }
    });
  }

  if (menuSettings) {
    menuSettings.addEventListener("click", (e) => {
      e.preventDefault();
      showSettings();
    });
  }

  if (menuLogout) {
    menuLogout.addEventListener("click", (e) => {
      e.preventDefault();
      signOut();
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const menu = document.getElementById("user-menu");
    const trigger = document.getElementById("user-menu-trigger");
    if (
      menu &&
      trigger &&
      !menu.contains(e.target) &&
      !trigger.contains(e.target)
    ) {
      menu.classList.remove("active");
    }
  });
}

/**
 * Migrate local data to cloud when user logs in
 * @param {string} userId - User ID
 */
function migrateLocalDataToCloud(userId) {
  if (!firebaseInitialized) return;

  const brdList = JSON.parse(localStorage.getItem("brd_list") || "[]");
  if (brdList.length === 0) return;

  const db = firebase.firestore();
  const batch = db.batch();
  const userBrdCollection = db
    .collection("users")
    .doc(userId)
    .collection("brds");

  brdList.forEach((brd) => {
    const brdData = JSON.parse(localStorage.getItem(`brd_${brd.id}`) || "null");
    if (brdData) {
      const docRef = userBrdCollection.doc(brd.id);
      batch.set(docRef, brdData);
    }
  });

  batch
    .commit()
    .then(() => {
      showToast("Data berhasil disinkronkan ke cloud!", "success");
    })
    .catch((error) => {
      console.error("Migration error:", error);
      showToast("Gagal sinkronisasi data: " + error.message, "error");
    });
}
