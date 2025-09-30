/**
 * PDF Generator for BRD Documents
 * Handles professional PDF generation with proper formatting and styling
 */

class PDFGenerator {
  constructor() {
    this.doc = null;
    this.pageWidth = 0;
    this.pageHeight = 0;
    this.margin = 20;
    this.lineHeight = 6;
    this.currentY = 0;
    this.headerHeight = 40;
    this.footerHeight = 20;

    // Color scheme
    this.colors = {
      primary: [42, 59, 79], // Dark blue
      secondary: [60, 91, 112], // Medium blue
      accent: [0, 123, 191], // Light blue
      text: [33, 37, 41], // Dark gray
      lightText: [108, 117, 125], // Light gray
      background: [248, 249, 250], // Light background
      white: [255, 255, 255],
    };

    // Font sizes
    this.fontSizes = {
      title: 24,
      heading1: 18,
      heading2: 14,
      heading3: 12,
      body: 10,
      caption: 8,
      small: 7,
    };
  }

  /**
   * Initialize PDF document
   * @param {string} orientation - 'portrait' or 'landscape'
   * @param {string} format - 'a4', 'letter', etc.
   */
  initializeDocument(orientation = "portrait", format = "a4") {
    if (typeof window.jspdf === "undefined") {
      throw new Error("jsPDF library tidak tersedia");
    }

    const { jsPDF } = window.jspdf;

    this.doc = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: format,
      compress: true,
    });

    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.currentY = this.margin + this.headerHeight;

    // Set document properties
    this.doc.setProperties({
      title: "Business Requirement Document",
      subject: "BRD",
      author: "BRD Generator",
      creator: "BRD Generator App",
      producer: "BRD Generator",
    });
  }

  /**
   * Generate PDF from BRD data
   * @param {Object} brdData - BRD data object
   * @returns {Promise<void>}
   */
  async generatePDF(brdData) {
    try {
      this.initializeDocument();

      // Set document title
      const title = brdData.title || "Business Requirement Document";
      this.doc.setProperties({ title: title });

      // Generate cover page
      this.generateCoverPage(brdData);

      // Generate table of contents
      this.generateTableOfContents(brdData);

      // Generate content pages
      await this.generateContentPages(brdData);

      // Add page numbers
      this.addPageNumbers();

      // Download the PDF
      const fileName = this.sanitizeFileName(title) + ".pdf";
      this.doc.save(fileName);

      window.showToast && window.showToast("PDF berhasil diunduh!", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      window.showToast &&
        window.showToast("Error saat membuat PDF: " + error.message, "error");
      throw error;
    }
  }

  /**
   * Generate cover page
   * @param {Object} brdData - BRD data
   */
  generateCoverPage(brdData) {
    // Background header
    this.doc.setFillColor(...this.colors.primary);
    this.doc.rect(0, 0, this.pageWidth, 60, "F");

    // Company name
    this.doc.setTextColor(...this.colors.white);
    this.doc.setFontSize(this.fontSizes.heading2);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      brdData["nama-perusahaan"] || "Company Name",
      this.margin,
      30
    );

    // Document type
    this.doc.setFontSize(this.fontSizes.caption);
    this.doc.text("Business Requirement Document", this.margin, 45);

    // Main title
    this.doc.setTextColor(...this.colors.text);
    this.doc.setFontSize(this.fontSizes.title);
    this.doc.setFont("helvetica", "bold");

    const titleText = brdData.title || "Business Requirement Document";
    const titleLines = this.doc.splitTextToSize(
      titleText,
      this.pageWidth - 2 * this.margin
    );
    const titleY = 100;

    this.doc.text(titleLines, this.pageWidth / 2, titleY, { align: "center" });

    // Version and date
    this.doc.setFontSize(this.fontSizes.body);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...this.colors.lightText);

    const versionText = `Version: ${brdData.versi || "1.0"}`;
    const dateText = `Date: ${this.formatDate(
      brdData.tanggal || new Date().toISOString()
    )}`;

    this.doc.text(versionText, this.pageWidth / 2, titleY + 30, {
      align: "center",
    });
    this.doc.text(dateText, this.pageWidth / 2, titleY + 40, {
      align: "center",
    });

    // Author information
    if (brdData["prepared-by"]) {
      this.doc.text(
        `Prepared by: ${brdData["prepared-by"]}`,
        this.pageWidth / 2,
        titleY + 60,
        { align: "center" }
      );
    }

    // Footer
    this.doc.setFontSize(this.fontSizes.small);
    this.doc.setTextColor(...this.colors.lightText);
    this.doc.text(
      "CONFIDENTIAL - INTERNAL USE ONLY",
      this.pageWidth / 2,
      this.pageHeight - 15,
      { align: "center" }
    );
  }

  /**
   * Generate table of contents
   * @param {Object} brdData - BRD data
   */
  generateTableOfContents(brdData) {
    this.doc.addPage();
    this.addPageHeader("Table of Contents", brdData["nama-perusahaan"]);

    this.currentY = this.margin + this.headerHeight + 10;

    // TOC Title
    this.doc.setFontSize(this.fontSizes.heading1);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...this.colors.primary);
    this.doc.text("Table of Contents", this.margin, this.currentY);

    this.currentY += 15;

    // TOC entries
    const tocEntries = this.generateTOCEntries(brdData);

    this.doc.setFontSize(this.fontSizes.body);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...this.colors.text);

    let pageNumber = 3; // Starting after cover and TOC

    tocEntries.forEach((entry) => {
      if (this.currentY > this.pageHeight - this.footerHeight - 10) {
        this.doc.addPage();
        this.addPageHeader("Table of Contents", brdData["nama-perusahaan"]);
        this.currentY = this.margin + this.headerHeight + 10;
      }

      // Entry title
      this.doc.text(
        `${entry.number}. ${entry.title}`,
        this.margin,
        this.currentY
      );

      // Page number
      this.doc.text(
        pageNumber.toString(),
        this.pageWidth - this.margin,
        this.currentY,
        { align: "right" }
      );

      // Dots
      const titleWidth = this.doc.getTextWidth(
        `${entry.number}. ${entry.title}`
      );
      const pageNumberWidth = this.doc.getTextWidth(pageNumber.toString());
      const dotsStart = this.margin + titleWidth + 2;
      const dotsEnd = this.pageWidth - this.margin - pageNumberWidth - 2;

      if (dotsEnd > dotsStart) {
        this.addDottedLine(dotsStart, this.currentY - 1, dotsEnd);
      }

      this.currentY += this.lineHeight;
      pageNumber++;
    });
  }

  /**
   * Generate TOC entries
   * @param {Object} brdData - BRD data
   * @returns {Array} TOC entries
   */
  generateTOCEntries(brdData) {
    const entries = [
      { number: "1", title: "Document Information" },
      { number: "2", title: "Project Overview" },
      { number: "3", title: "Stakeholders" },
      { number: "4", title: "Functional Requirements" },
      { number: "5", title: "Non-Functional Requirements" },
      { number: "6", title: "Constraints and Assumptions" },
      { number: "7", title: "Timeline and Milestones" },
      { number: "8", title: "Approval" },
    ];

    return entries;
  }

  /**
   * Generate content pages
   * @param {Object} brdData - BRD data
   */
  async generateContentPages(brdData) {
    const sections = [
      {
        title: "Document Information",
        fields: [
          { label: "Title", key: "title" },
          { label: "Company/Organization", key: "nama-perusahaan" },
          { label: "Version", key: "versi" },
          { label: "Date", key: "tanggal", type: "date" },
          { label: "Description", key: "deskripsi-singkat", type: "paragraph" },
        ],
      },
      {
        title: "Project Overview",
        fields: [
          { label: "Background", key: "latar-belakang", type: "paragraph" },
          { label: "Objectives", key: "tujuan", type: "paragraph" },
          { label: "Scope", key: "ruang-lingkup", type: "paragraph" },
          { label: "Expected Benefits", key: "manfaat", type: "paragraph" },
        ],
      },
      {
        title: "Stakeholders",
        fields: [
          { label: "Project Sponsor", key: "project-sponsor" },
          { label: "Project Manager", key: "project-manager" },
          { label: "Business Analyst", key: "business-analyst" },
          {
            label: "Other Stakeholders",
            key: "stakeholder-lain",
            type: "paragraph",
          },
        ],
      },
      {
        title: "Functional Requirements",
        fields: [
          {
            label: "Main Requirements",
            key: "kebutuhan-utama",
            type: "paragraph",
          },
          {
            label: "Additional Requirements",
            key: "kebutuhan-tambahan",
            type: "paragraph",
          },
          {
            label: "Business Processes",
            key: "proses-bisnis",
            type: "paragraph",
          },
        ],
      },
      {
        title: "Non-Functional Requirements",
        fields: [
          {
            label: "Performance Requirements",
            key: "performa",
            type: "paragraph",
          },
          {
            label: "Security Requirements",
            key: "keamanan",
            type: "paragraph",
          },
          { label: "Scalability", key: "skalabilitas", type: "paragraph" },
          { label: "Compatibility", key: "kompatibilitas", type: "paragraph" },
        ],
      },
      {
        title: "Constraints and Assumptions",
        fields: [
          {
            label: "Technical Constraints",
            key: "batasan-teknis",
            type: "paragraph",
          },
          {
            label: "Budget Constraints",
            key: "batasan-anggaran",
            type: "paragraph",
          },
          {
            label: "Time Constraints",
            key: "batasan-waktu",
            type: "paragraph",
          },
          { label: "Assumptions", key: "asumsi", type: "paragraph" },
        ],
      },
      {
        title: "Timeline and Milestones",
        fields: [
          { label: "Project Start Date", key: "tanggal-mulai", type: "date" },
          { label: "Target End Date", key: "tanggal-selesai", type: "date" },
          { label: "Key Milestones", key: "milestone", type: "paragraph" },
          { label: "Deliverables", key: "deliverables", type: "paragraph" },
        ],
      },
      {
        title: "Approval",
        fields: [
          { label: "Prepared By", key: "prepared-by" },
          { label: "Reviewed By", key: "reviewed-by" },
          { label: "Approved By", key: "approved-by" },
          {
            label: "Approval Notes",
            key: "catatan-persetujuan",
            type: "paragraph",
          },
        ],
      },
    ];

    sections.forEach((section, index) => {
      this.generateSection(section, brdData, index + 1);
    });
  }

  /**
   * Generate a content section
   * @param {Object} section - Section definition
   * @param {Object} brdData - BRD data
   * @param {number} sectionNumber - Section number
   */
  generateSection(section, brdData, sectionNumber) {
    this.doc.addPage();
    this.addPageHeader(section.title, brdData["nama-perusahaan"]);

    this.currentY = this.margin + this.headerHeight + 10;

    // Section title
    this.doc.setFontSize(this.fontSizes.heading1);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...this.colors.primary);
    this.doc.text(
      `${sectionNumber}. ${section.title}`,
      this.margin,
      this.currentY
    );

    this.currentY += 15;

    // Section fields
    section.fields.forEach((field) => {
      const value = brdData[field.key];
      if (value && value.trim()) {
        this.addField(field.label, value, field.type);
      }
    });
  }

  /**
   * Add a field to the PDF
   * @param {string} label - Field label
   * @param {string} value - Field value
   * @param {string} type - Field type ('paragraph', 'date', etc.)
   */
  addField(label, value, type = "text") {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - this.footerHeight - 30) {
      this.doc.addPage();
      this.addPageHeader("", "");
      this.currentY = this.margin + this.headerHeight + 10;
    }

    // Field label
    this.doc.setFontSize(this.fontSizes.heading3);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...this.colors.secondary);
    this.doc.text(label, this.margin, this.currentY);

    this.currentY += 8;

    // Field value
    this.doc.setFontSize(this.fontSizes.body);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...this.colors.text);

    if (type === "date") {
      const formattedValue = this.formatDate(value);
      this.doc.text(formattedValue, this.margin, this.currentY);
      this.currentY += this.lineHeight + 3;
    } else if (type === "paragraph") {
      const lines = this.doc.splitTextToSize(
        value,
        this.pageWidth - 2 * this.margin
      );

      lines.forEach((line) => {
        // Check for page break
        if (this.currentY > this.pageHeight - this.footerHeight - 10) {
          this.doc.addPage();
          this.addPageHeader("", "");
          this.currentY = this.margin + this.headerHeight + 10;
        }

        this.doc.text(line, this.margin, this.currentY);
        this.currentY += this.lineHeight;
      });

      this.currentY += 5; // Extra space after paragraph
    } else {
      this.doc.text(value, this.margin, this.currentY);
      this.currentY += this.lineHeight + 3;
    }

    this.currentY += 5; // Space between fields
  }

  /**
   * Add page header
   * @param {string} sectionTitle - Current section title
   * @param {string} companyName - Company name
   */
  addPageHeader(sectionTitle, companyName) {
    // Header line
    this.doc.setDrawColor(...this.colors.secondary);
    this.doc.setLineWidth(0.5);
    this.doc.line(
      this.margin,
      this.margin + 15,
      this.pageWidth - this.margin,
      this.margin + 15
    );

    // Company name
    this.doc.setFontSize(this.fontSizes.caption);
    this.doc.setTextColor(...this.colors.secondary);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      companyName || "BRD Generator",
      this.margin,
      this.margin + 10
    );

    // Section title
    if (sectionTitle) {
      this.doc.text(
        sectionTitle,
        this.pageWidth - this.margin,
        this.margin + 10,
        { align: "right" }
      );
    }
  }

  /**
   * Add page numbers to all pages
   */
  addPageNumbers() {
    const totalPages = this.doc.internal.getNumberOfPages();

    for (let i = 2; i <= totalPages; i++) {
      // Skip cover page
      this.doc.setPage(i);

      // Page number
      this.doc.setFontSize(this.fontSizes.small);
      this.doc.setTextColor(...this.colors.lightText);
      this.doc.setFont("helvetica", "normal");

      const pageText = `Page ${i - 1} of ${totalPages - 1}`;
      this.doc.text(
        pageText,
        this.pageWidth - this.margin,
        this.pageHeight - 10,
        { align: "right" }
      );

      // Footer line
      this.doc.setDrawColor(...this.colors.lightText);
      this.doc.setLineWidth(0.2);
      this.doc.line(
        this.margin,
        this.pageHeight - 15,
        this.pageWidth - this.margin,
        this.pageHeight - 15
      );
    }
  }

  /**
   * Add dotted line for TOC
   * @param {number} startX - Start X position
   * @param {number} y - Y position
   * @param {number} endX - End X position
   */
  addDottedLine(startX, y, endX) {
    this.doc.setLineDash([0.5, 1]);
    this.doc.setDrawColor(...this.colors.lightText);
    this.doc.setLineWidth(0.2);
    this.doc.line(startX, y, endX, y);
    this.doc.setLineDash([]);
  }

  /**
   * Format date for display
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Sanitize filename for download
   * @param {string} filename - Original filename
   * @returns {string} Sanitized filename
   */
  sanitizeFileName(filename) {
    return filename
      .replace(/[^a-z0-9]/gi, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .toLowerCase();
  }

  /**
   * Generate PDF from BRD index
   * @param {number} brdIndex - Index of BRD to generate PDF for
   */
  async generatePDFFromIndex(brdIndex) {
    try {
      const brdData = await storage.loadBRD(brdIndex);
      if (!brdData) {
        throw new Error("BRD tidak ditemukan");
      }

      await this.generatePDF(brdData);
    } catch (error) {
      console.error("Error generating PDF from index:", error);
      throw error;
    }
  }

  /**
   * Generate PDF from current preview content
   */
  async generatePDFFromPreview() {
    try {
      // Get data from preview content
      const previewContent = document.getElementById("preview-content");
      if (!previewContent) {
        throw new Error("Preview content tidak ditemukan");
      }

      // Extract BRD data from preview (this would need to be implemented based on your preview structure)
      const brdData = this.extractBRDDataFromPreview(previewContent);

      await this.generatePDF(brdData);
    } catch (error) {
      console.error("Error generating PDF from preview:", error);
      throw error;
    }
  }

  /**
   * Extract BRD data from preview content (placeholder implementation)
   * @param {HTMLElement} previewContent - Preview content element
   * @returns {Object} Extracted BRD data
   */
  extractBRDDataFromPreview(previewContent) {
    // This is a placeholder - implement based on your preview structure
    const title =
      previewContent.querySelector("h1")?.textContent ||
      "Business Requirement Document";

    return {
      title: title,
      "nama-perusahaan": "Company Name",
      versi: "1.0",
      tanggal: new Date().toISOString(),
      // Add more fields as needed based on your preview structure
    };
  }
}

// Create and export PDF generator instance
const pdfGenerator = new PDFGenerator();

// Make available globally for compatibility
window.pdfGenerator = pdfGenerator;
window.downloadPDF = async (brdIndex) => {
  if (brdIndex !== undefined) {
    return await pdfGenerator.generatePDFFromIndex(brdIndex);
  } else {
    return await pdfGenerator.generatePDFFromPreview();
  }
};

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = PDFGenerator;
}
