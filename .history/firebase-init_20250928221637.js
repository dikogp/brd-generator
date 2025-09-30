// Berkas ini HANYA untuk pengembangan lokal agar tidak terjadi galat.
function initializeFirebase() {
  console.warn("Firebase tidak diinisialisasi dalam mode lokal.");
  return false; // Memberi tahu main.js bahwa Firebase tidak aktif
}
