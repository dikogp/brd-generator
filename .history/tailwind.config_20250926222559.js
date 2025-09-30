// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.{html,js}", // Memindai semua file .html dan .js di folder utama
    "./src/**/*.{html,js}", // Anda bisa menambahkan folder lain jika ada
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
