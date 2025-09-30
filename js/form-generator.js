/**
 * Form Generator for BRD Creation
 * Handles dynamic form generation, validation, and data management
 */

class FormGenerator {
  constructor() {
    this.currentStep = 0;
    this.sections = [];
    this.mode = "new"; // 'new' or 'edit'
    this.editIndex = null;
    this.formData = {};

    // Initialize form sections
    this.initializeSections();
  }

  /**
   * Initialize form sections with field definitions
   */
  initializeSections() {
    this.sections = [
      {
        id: "document-info",
        title: "Informasi Dokumen",
        description: "Informasi dasar tentang dokumen BRD",
        fields: [
          {
            type: "text",
            id: "title",
            name: "title",
            label: "Judul BRD",
            placeholder: "Masukkan judul BRD",
            required: true,
            validation: {
              minLength: 5,
              maxLength: 100,
            },
          },
          {
            type: "text",
            id: "nama-perusahaan",
            name: "nama-perusahaan",
            label: "Nama Perusahaan/Organisasi",
            placeholder: "Masukkan nama perusahaan",
            required: true,
            validation: {
              minLength: 2,
              maxLength: 100,
            },
          },
          {
            type: "text",
            id: "versi",
            name: "versi",
            label: "Versi Dokumen",
            placeholder: "1.0",
            required: true,
            defaultValue: "1.0",
          },
          {
            type: "date",
            id: "tanggal",
            name: "tanggal",
            label: "Tanggal Pembuatan",
            required: true,
            defaultValue: new Date().toISOString().split("T")[0],
          },
          {
            type: "textarea",
            id: "deskripsi-singkat",
            name: "deskripsi-singkat",
            label: "Deskripsi Singkat",
            placeholder: "Deskripsi singkat tentang proyek atau sistem",
            rows: 3,
            validation: {
              maxLength: 500,
            },
          },
        ],
      },
      {
        id: "project-overview",
        title: "Gambaran Umum Proyek",
        description: "Latar belakang dan tujuan proyek",
        fields: [
          {
            type: "textarea",
            id: "latar-belakang",
            name: "latar-belakang",
            label: "Latar Belakang",
            placeholder: "Jelaskan latar belakang dan konteks proyek",
            rows: 5,
            required: true,
            validation: {
              minLength: 50,
              maxLength: 2000,
            },
          },
          {
            type: "textarea",
            id: "tujuan",
            name: "tujuan",
            label: "Tujuan Proyek",
            placeholder: "Jelaskan tujuan yang ingin dicapai",
            rows: 4,
            required: true,
            validation: {
              minLength: 30,
              maxLength: 1500,
            },
          },
          {
            type: "textarea",
            id: "ruang-lingkup",
            name: "ruang-lingkup",
            label: "Ruang Lingkup",
            placeholder:
              "Jelaskan ruang lingkup proyek (apa yang termasuk dan tidak termasuk)",
            rows: 4,
            validation: {
              maxLength: 1500,
            },
          },
          {
            type: "textarea",
            id: "manfaat",
            name: "manfaat",
            label: "Manfaat yang Diharapkan",
            placeholder: "Jelaskan manfaat yang diharapkan dari proyek ini",
            rows: 3,
            validation: {
              maxLength: 1000,
            },
          },
        ],
      },
      {
        id: "stakeholders",
        title: "Stakeholder",
        description: "Pihak-pihak yang terlibat dalam proyek",
        fields: [
          {
            type: "text",
            id: "project-sponsor",
            name: "project-sponsor",
            label: "Sponsor Proyek",
            placeholder: "Nama dan jabatan sponsor proyek",
            required: true,
          },
          {
            type: "text",
            id: "project-manager",
            name: "project-manager",
            label: "Project Manager",
            placeholder: "Nama dan kontak project manager",
            required: true,
          },
          {
            type: "text",
            id: "business-analyst",
            name: "business-analyst",
            label: "Business Analyst",
            placeholder: "Nama dan kontak business analyst",
          },
          {
            type: "textarea",
            id: "stakeholder-lain",
            name: "stakeholder-lain",
            label: "Stakeholder Lainnya",
            placeholder:
              "Daftar stakeholder lain yang terlibat (pisahkan dengan baris baru)",
            rows: 4,
          },
        ],
      },
      {
        id: "requirements",
        title: "Kebutuhan Fungsional",
        description: "Kebutuhan fungsional sistem atau proses",
        fields: [
          {
            type: "textarea",
            id: "kebutuhan-utama",
            name: "kebutuhan-utama",
            label: "Kebutuhan Utama",
            placeholder:
              "Jelaskan kebutuhan fungsional utama (pisahkan dengan bullet points)",
            rows: 6,
            required: true,
            validation: {
              minLength: 50,
            },
          },
          {
            type: "textarea",
            id: "kebutuhan-tambahan",
            name: "kebutuhan-tambahan",
            label: "Kebutuhan Tambahan",
            placeholder: "Kebutuhan fungsional tambahan atau yang diinginkan",
            rows: 4,
          },
          {
            type: "textarea",
            id: "proses-bisnis",
            name: "proses-bisnis",
            label: "Proses Bisnis",
            placeholder: "Jelaskan proses bisnis yang akan didukung sistem",
            rows: 5,
          },
        ],
      },
      {
        id: "non-functional",
        title: "Kebutuhan Non-Fungsional",
        description: "Kebutuhan teknis dan kualitas sistem",
        fields: [
          {
            type: "textarea",
            id: "performa",
            name: "performa",
            label: "Kebutuhan Performa",
            placeholder:
              "Jelaskan kebutuhan performa (response time, throughput, dll)",
            rows: 3,
          },
          {
            type: "textarea",
            id: "keamanan",
            name: "keamanan",
            label: "Kebutuhan Keamanan",
            placeholder: "Jelaskan kebutuhan keamanan sistem",
            rows: 3,
          },
          {
            type: "textarea",
            id: "skalabilitas",
            name: "skalabilitas",
            label: "Skalabilitas",
            placeholder: "Jelaskan kebutuhan skalabilitas sistem",
            rows: 3,
          },
          {
            type: "textarea",
            id: "kompatibilitas",
            name: "kompatibilitas",
            label: "Kompatibilitas",
            placeholder:
              "Jelaskan kebutuhan kompatibilitas (browser, OS, perangkat)",
            rows: 3,
          },
        ],
      },
      {
        id: "constraints",
        title: "Batasan dan Asumsi",
        description: "Batasan proyek dan asumsi yang dibuat",
        fields: [
          {
            type: "textarea",
            id: "batasan-teknis",
            name: "batasan-teknis",
            label: "Batasan Teknis",
            placeholder: "Jelaskan batasan teknis yang ada",
            rows: 4,
          },
          {
            type: "textarea",
            id: "batasan-anggaran",
            name: "batasan-anggaran",
            label: "Batasan Anggaran",
            placeholder: "Jelaskan batasan anggaran proyek",
            rows: 3,
          },
          {
            type: "textarea",
            id: "batasan-waktu",
            name: "batasan-waktu",
            label: "Batasan Waktu",
            placeholder: "Jelaskan batasan waktu dan deadline",
            rows: 3,
          },
          {
            type: "textarea",
            id: "asumsi",
            name: "asumsi",
            label: "Asumsi",
            placeholder: "Jelaskan asumsi-asumsi yang dibuat dalam proyek",
            rows: 4,
          },
        ],
      },
      {
        id: "timeline",
        title: "Timeline dan Milestone",
        description: "Jadwal dan pencapaian penting proyek",
        fields: [
          {
            type: "date",
            id: "tanggal-mulai",
            name: "tanggal-mulai",
            label: "Tanggal Mulai Proyek",
            required: true,
          },
          {
            type: "date",
            id: "tanggal-selesai",
            name: "tanggal-selesai",
            label: "Target Tanggal Selesai",
            required: true,
          },
          {
            type: "textarea",
            id: "milestone",
            name: "milestone",
            label: "Milestone Utama",
            placeholder:
              "Daftar milestone dan target tanggal (pisahkan dengan baris baru)",
            rows: 6,
          },
          {
            type: "textarea",
            id: "deliverables",
            name: "deliverables",
            label: "Deliverables",
            placeholder: "Daftar deliverables dan jadwal penyerahan",
            rows: 4,
          },
        ],
      },
      {
        id: "approval",
        title: "Persetujuan",
        description: "Informasi persetujuan dan sign-off",
        fields: [
          {
            type: "text",
            id: "prepared-by",
            name: "prepared-by",
            label: "Disusun Oleh",
            placeholder: "Nama dan jabatan penyusun",
            required: true,
          },
          {
            type: "text",
            id: "reviewed-by",
            name: "reviewed-by",
            label: "Direview Oleh",
            placeholder: "Nama dan jabatan reviewer",
          },
          {
            type: "text",
            id: "approved-by",
            name: "approved-by",
            label: "Disetujui Oleh",
            placeholder: "Nama dan jabatan yang menyetujui",
          },
          {
            type: "textarea",
            id: "catatan-persetujuan",
            name: "catatan-persetujuan",
            label: "Catatan Persetujuan",
            placeholder: "Catatan tambahan terkait persetujuan",
            rows: 3,
          },
        ],
      },
    ];
  }

  /**
   * Generate and display the form
   * @param {string} mode - 'new' or 'edit'
   * @param {number} editIndex - Index of BRD to edit (if mode is 'edit')
   */
  async generateForm(mode = "new", editIndex = null) {
    this.mode = mode;
    this.editIndex = editIndex;
    this.currentStep = 0;

    try {
      // Clear existing form
      const formContainer = document.getElementById("brd-form");
      if (formContainer) {
        formContainer.innerHTML = "";
      }

      // Build sidebar navigation
      this.buildSidebarNav();

      // Load form data if editing
      if (mode === "edit" && editIndex !== null) {
        await this.loadBRDForEditing(editIndex);
      }

      // Load first section
      this.loadFormSection(0);

      // Setup navigation
      this.setupNavigation();

      // Update sidebar user info
      this.updateSidebarUserInfo();
    } catch (error) {
      console.error("Error generating form:", error);
      throw new Error("Gagal membuat form: " + error.message);
    }
  }

  /**
   * Build sidebar navigation
   */
  buildSidebarNav() {
    const sidebar = document.getElementById("sidebar-nav");
    if (!sidebar) return;

    sidebar.innerHTML = "";

    this.sections.forEach((section, index) => {
      const sidebarItem = document.createElement("div");
      sidebarItem.className = `sidebar-link flex items-center p-3 rounded transition-all ${
        index === 0 ? "active" : ""
      }`;
      sidebarItem.dataset.sectionIndex = index;

      sidebarItem.innerHTML = `
        <span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 mr-3 text-sm font-medium">
          ${index + 1}
        </span>
        <div class="flex-1">
          <div class="font-medium">${section.title}</div>
          <div class="text-xs text-gray-400 mt-1">${section.description}</div>
        </div>
      `;

      sidebarItem.addEventListener("click", () => {
        if (this.currentStep !== index) {
          this.saveCurrentSectionData();
          this.loadFormSection(index);
        }
      });

      sidebar.appendChild(sidebarItem);
    });
  }

  /**
   * Load a specific form section
   * @param {number} index - Section index
   */
  loadFormSection(index) {
    if (!this.sections || index >= this.sections.length) {
      console.error("Invalid section index:", index);
      return;
    }

    const section = this.sections[index];
    this.currentStep = index;

    // Update sidebar active state
    this.updateSidebarActiveState(index);

    // Build form for this section
    this.buildSectionForm(section);

    // Update navigation buttons
    this.updateNavigationButtons();

    // Load saved data
    this.loadSavedSectionData(section);
  }

  /**
   * Update sidebar active state
   * @param {number} activeIndex - Index of active section
   */
  updateSidebarActiveState(activeIndex) {
    const sidebarItems = document.querySelectorAll(".sidebar-link");
    sidebarItems.forEach((item, index) => {
      if (index === activeIndex) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  /**
   * Build form for a section
   * @param {Object} section - Section object
   */
  buildSectionForm(section) {
    const formContainer = document.getElementById("brd-form");
    if (!formContainer) return;

    formContainer.innerHTML = `
      <div class="mb-8">
        <h2 class="text-2xl font-semibold text-white mb-2">${section.title}</h2>
        <p class="text-gray-400">${section.description}</p>
      </div>
    `;

    // Add fields
    section.fields.forEach((field) => {
      const fieldElement = this.createFieldElement(field);
      formContainer.appendChild(fieldElement);
    });
  }

  /**
   * Create a form field element
   * @param {Object} field - Field definition
   * @returns {HTMLElement} Field element
   */
  createFieldElement(field) {
    const fieldWrapper = document.createElement("div");
    fieldWrapper.className = "mb-6";

    const fieldId = `input-${field.id}`;

    // Create label
    const label = document.createElement("label");
    label.htmlFor = fieldId;
    label.className = "block text-sm font-medium text-gray-300 mb-2";
    label.innerHTML = `
      ${field.label} 
      ${field.required ? '<span class="text-red-400">*</span>' : ""}
    `;

    // Create input element based on type
    let inputElement;

    switch (field.type) {
      case "text":
        inputElement = this.createTextInput(field, fieldId);
        break;
      case "textarea":
        inputElement = this.createTextarea(field, fieldId);
        break;
      case "date":
        inputElement = this.createDateInput(field, fieldId);
        break;
      case "select":
        inputElement = this.createSelect(field, fieldId);
        break;
      case "number":
        inputElement = this.createNumberInput(field, fieldId);
        break;
      default:
        inputElement = this.createTextInput(field, fieldId);
    }

    // Add validation attributes
    if (field.required) {
      inputElement.required = true;
    }

    // Add event listeners
    inputElement.addEventListener("blur", () => {
      this.validateField(field, inputElement);
    });

    inputElement.addEventListener("input", () => {
      this.clearFieldValidation(inputElement);
    });

    fieldWrapper.appendChild(label);
    fieldWrapper.appendChild(inputElement);

    // Add help text if exists
    if (field.help) {
      const helpText = document.createElement("p");
      helpText.className = "text-xs text-gray-500 mt-1";
      helpText.textContent = field.help;
      fieldWrapper.appendChild(helpText);
    }

    return fieldWrapper;
  }

  /**
   * Create text input element
   */
  createTextInput(field, fieldId) {
    const input = document.createElement("input");
    input.type = "text";
    input.id = fieldId;
    input.name = field.name;
    input.placeholder = field.placeholder || "";
    input.className =
      "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white";

    if (field.defaultValue) {
      input.value = field.defaultValue;
    }

    return input;
  }

  /**
   * Create textarea element
   */
  createTextarea(field, fieldId) {
    const textarea = document.createElement("textarea");
    textarea.id = fieldId;
    textarea.name = field.name;
    textarea.rows = field.rows || 4;
    textarea.placeholder = field.placeholder || "";
    textarea.className =
      "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white";

    if (field.defaultValue) {
      textarea.value = field.defaultValue;
    }

    return textarea;
  }

  /**
   * Create date input element
   */
  createDateInput(field, fieldId) {
    const input = document.createElement("input");
    input.type = "date";
    input.id = fieldId;
    input.name = field.name;
    input.className =
      "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white";

    if (field.defaultValue) {
      input.value = field.defaultValue;
    }

    return input;
  }

  /**
   * Create select element
   */
  createSelect(field, fieldId) {
    const select = document.createElement("select");
    select.id = fieldId;
    select.name = field.name;
    select.className =
      "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white";

    // Add default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = `-- Pilih ${field.label} --`;
    select.appendChild(defaultOption);

    // Add options
    if (field.options) {
      field.options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        select.appendChild(optionElement);
      });
    }

    return select;
  }

  /**
   * Create number input element
   */
  createNumberInput(field, fieldId) {
    const input = document.createElement("input");
    input.type = "number";
    input.id = fieldId;
    input.name = field.name;
    input.placeholder = field.placeholder || "";
    input.className =
      "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white";

    if (field.min !== undefined) input.min = field.min;
    if (field.max !== undefined) input.max = field.max;
    if (field.step !== undefined) input.step = field.step;
    if (field.defaultValue) input.value = field.defaultValue;

    return input;
  }

  /**
   * Setup navigation buttons
   */
  setupNavigation() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (prevBtn) {
      prevBtn.onclick = () => this.navigatePrevious();
    }

    if (nextBtn) {
      nextBtn.onclick = () => this.navigateNext();
    }
  }

  /**
   * Navigate to previous section
   */
  navigatePrevious() {
    if (this.currentStep > 0) {
      this.saveCurrentSectionData();
      this.loadFormSection(this.currentStep - 1);
    }
  }

  /**
   * Navigate to next section or save
   */
  async navigateNext() {
    if (this.validateCurrentSection()) {
      this.saveCurrentSectionData();

      if (this.currentStep < this.sections.length - 1) {
        this.loadFormSection(this.currentStep + 1);
      } else {
        await this.saveBRD();
      }
    }
  }

  /**
   * Update navigation buttons state
   */
  updateNavigationButtons() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (prevBtn) {
      prevBtn.disabled = this.currentStep === 0;
      prevBtn.style.opacity = this.currentStep === 0 ? "0.5" : "1";
    }

    if (nextBtn) {
      nextBtn.textContent =
        this.currentStep === this.sections.length - 1
          ? "Simpan BRD"
          : "Selanjutnya";
    }
  }

  /**
   * Validate current section
   * @returns {boolean} True if valid
   */
  validateCurrentSection() {
    const currentSection = this.sections[this.currentStep];
    let isValid = true;

    // Clear previous validation
    document.querySelectorAll(".invalid-field").forEach((el) => {
      el.classList.remove("invalid-field");
    });

    currentSection.fields.forEach((field) => {
      const fieldId = `input-${field.id}`;
      const element = document.getElementById(fieldId);

      if (element && !this.validateField(field, element)) {
        isValid = false;
      }
    });

    if (!isValid) {
      window.showToast(
        "Mohon isi semua kolom yang diperlukan dengan benar",
        "error"
      );
    }

    return isValid;
  }

  /**
   * Validate individual field
   * @param {Object} field - Field definition
   * @param {HTMLElement} element - Input element
   * @returns {boolean} True if valid
   */
  validateField(field, element) {
    const value = element.value.trim();
    let isValid = true;

    // Required validation
    if (field.required && !value) {
      this.markFieldInvalid(element, "Field ini wajib diisi");
      isValid = false;
    }

    // Length validation
    if (value && field.validation) {
      const validation = field.validation;

      if (validation.minLength && value.length < validation.minLength) {
        this.markFieldInvalid(
          element,
          `Minimal ${validation.minLength} karakter`
        );
        isValid = false;
      }

      if (validation.maxLength && value.length > validation.maxLength) {
        this.markFieldInvalid(
          element,
          `Maksimal ${validation.maxLength} karakter`
        );
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Mark field as invalid
   * @param {HTMLElement} element - Input element
   * @param {string} message - Error message
   */
  markFieldInvalid(element, message) {
    element.classList.add("invalid-field");

    // Show error message
    let errorElement = element.parentNode.querySelector(".field-error");
    if (!errorElement) {
      errorElement = document.createElement("p");
      errorElement.className = "field-error text-xs text-red-400 mt-1";
      element.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
  }

  /**
   * Clear field validation
   * @param {HTMLElement} element - Input element
   */
  clearFieldValidation(element) {
    element.classList.remove("invalid-field");
    const errorElement = element.parentNode.querySelector(".field-error");
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Save current section data
   */
  saveCurrentSectionData() {
    const currentFormData = this.getCurrentFormData();
    Object.assign(this.formData, currentFormData);

    // Also save to storage as temp data
    storage.saveTempData(this.formData);
  }

  /**
   * Get current form data
   * @returns {Object} Form data object
   */
  getCurrentFormData() {
    const data = {};
    const inputs = document.querySelectorAll(
      "#brd-form input, #brd-form textarea, #brd-form select"
    );

    inputs.forEach((input) => {
      if (input.name) {
        data[input.name] = input.value;
      }
    });

    return data;
  }

  /**
   * Load saved section data
   * @param {Object} section - Current section
   */
  loadSavedSectionData(section) {
    const tempData = storage.getTempData();

    section.fields.forEach((field) => {
      const fieldId = `input-${field.id}`;
      const element = document.getElementById(fieldId);

      if (element && tempData[field.name]) {
        element.value = tempData[field.name];
      }
    });
  }

  /**
   * Load BRD data for editing
   * @param {number} index - BRD index
   */
  async loadBRDForEditing(index) {
    try {
      const brdData = await storage.loadBRD(index);
      if (brdData) {
        this.formData = { ...brdData };
        storage.loadTempDataForEditing(brdData);
      }
    } catch (error) {
      console.error("Error loading BRD for editing:", error);
      window.showToast("Gagal memuat data BRD untuk edit", "error");
    }
  }

  /**
   * Save BRD data
   */
  async saveBRD() {
    try {
      // Get final form data
      this.saveCurrentSectionData();

      // Add metadata
      const brdData = {
        ...this.formData,
        id: this.formData.id || storage.generateUniqueId(),
        lastUpdated: new Date().toISOString(),
        createdAt: this.formData.createdAt || new Date().toISOString(),
      };

      // Save to storage
      const brdId = await storage.saveBRD(brdData, this.mode, this.editIndex);

      // Clear temp data
      storage.clearTempData();

      // Show success message
      window.showToast("BRD berhasil disimpan!", "success");

      // Return to main menu after delay
      setTimeout(() => {
        if (window.showMainMenu) {
          window.showMainMenu();
        }
      }, 1500);

      return brdId;
    } catch (error) {
      console.error("Error saving BRD:", error);
      window.showToast("Gagal menyimpan BRD: " + error.message, "error");
      throw error;
    }
  }

  /**
   * Update sidebar user info
   */
  updateSidebarUserInfo() {
    const userArea = document.getElementById("sidebar-user-area");
    if (!userArea) return;

    const currentUser = firebase.auth ? firebase.auth().currentUser : null;

    if (currentUser) {
      userArea.innerHTML = `
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full overflow-hidden mr-2">
            <img src="${
              currentUser.photoURL ||
              "https://img.icons8.com/fluency/96/user-male-circle.png"
            }" 
                 alt="User" class="w-full h-full object-cover">
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-gray-200 truncate">${
              currentUser.displayName || "User"
            }</div>
            <div class="text-xs text-gray-400 truncate">${
              currentUser.email || ""
            }</div>
          </div>
        </div>
      `;
    } else if (storage.getUserMode() === "guest") {
      userArea.innerHTML = `
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <div class="text-gray-400">Mode Tamu</div>
            <div class="text-xs text-gray-500">Data lokal</div>
          </div>
        </div>
      `;
    } else {
      userArea.innerHTML = `
        <div class="text-center">
          <button class="text-xs text-blue-400 hover:text-blue-300" onclick="window.showSettings && window.showSettings()">
            Masuk untuk menyimpan
          </button>
        </div>
      `;
    }
  }

  /**
   * Get form progress percentage
   * @returns {number} Progress percentage
   */
  getProgress() {
    const completedSections = this.currentStep;
    const totalSections = this.sections.length;
    return Math.round((completedSections / totalSections) * 100);
  }

  /**
   * Reset form
   */
  reset() {
    this.currentStep = 0;
    this.formData = {};
    this.mode = "new";
    this.editIndex = null;
    storage.clearTempData();
  }
}

// Create and export form generator instance
const formGenerator = new FormGenerator();

// Make available globally for compatibility
window.formGenerator = formGenerator;
window.generateForm = (mode, editIndex) =>
  formGenerator.generateForm(mode, editIndex);
window.buildSidebarNav = () => formGenerator.buildSidebarNav();
window.loadFormSection = (index) => formGenerator.loadFormSection(index);
window.validateCurrentSection = () => formGenerator.validateCurrentSection();
window.saveCurrentSectionData = () => formGenerator.saveCurrentSectionData();
window.getCurrentFormData = () => formGenerator.getCurrentFormData();
window.loadSavedSectionData = (section) =>
  formGenerator.loadSavedSectionData(section);
window.loadBRDData = (index) => formGenerator.loadBRDForEditing(index);
window.saveBRD = () => formGenerator.saveBRD();
